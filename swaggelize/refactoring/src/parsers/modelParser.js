const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const utils = require("../utils/utils");
const { SWAG_TAG, getValueFromNode } = require("../utils/constants");

// Extract all model definitions from code
function extractModelDefinitions(modelDefinition) {
    return modelDefinition.node.arguments[0]?.value;
}

// Extract fields from model definition with @swag annotations
function extractFields(modelDefinition) {
    const fields = [];
    const fieldsNode = modelDefinition.node.arguments[1];

    if (!t.isObjectExpression(fieldsNode)) return fields;

    fieldsNode.properties.forEach(prop => {
        const fieldName = prop.key.name || prop.key.value;
        const fieldValue = getValueFromNode(prop.value);

        // Check for @swag comments
        const swagComment = prop.leadingComments?.find(c =>
            c.value.includes(SWAG_TAG)
        );

        if (swagComment) {
            const { methods, description } = utils.getMethodsAndDescriptionFromComment(swagComment.value.trim());

            fields.push({
                field: fieldName,
                type: 'field',
                object: fieldValue,
                comment: {
                    methods: methods || [],
                    description: description || ''
                }
            });
        }
    });

    return fields;
}

// Extract timestamp fields if enabled in model options
function extractTimestampFields(modelDefinition) {
    const options = modelDefinition.node.arguments[2]
        ? getValueFromNode(modelDefinition.node.arguments[2])
        : {};

    if (!options.timestamps) return [];

    return [
        {
            field: 'createdAt',
            type: 'field',
            object: {
                type: 'DataTypes.DATE',
                allowNull: false
            },
            comment: {
                methods: ['item', 'list'],
                description: 'Date when the record was created'
            }
        },
        {
            field: 'updatedAt',
            type: 'field',
            object: {
                type: 'DataTypes.DATE',
                allowNull: false
            },
            comment: {
                methods: ['item', 'list'],
                description: 'Date when the record was last updated'
            }
        }
    ];
}

function mainParser(code) {
    const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
    });

    const modelDefinitions = [];

    traverse(ast, {
        CallExpression(path) {
            if (!t.isMemberExpression(path.node.callee)) return;
            if (path.node.callee.property.name !== 'define') return;

            const modelName = path.node.arguments[0]?.value;
            if (!modelName) return;

            modelDefinitions.push({
                node: path.node,
                name: modelName,
                astPath: path
            });
        }
    });

    return modelDefinitions;
}

// Main parser function
function modelParser(code) {
    const modelDefinitions = mainParser(code);
    const models = [];

    modelDefinitions.forEach(modelDef => {
        const modelName = extractModelDefinitions(modelDef);
        const fields = extractFields(modelDef);
        const timestampFields = extractTimestampFields(modelDef);

        models.push({
            sequelizeModel: modelName,
            value: [...fields, ...timestampFields],
            options: modelDef.node.arguments[2]
                ? getValueFromNode(modelDef.node.arguments[2])
                : {}
        });
    });

    return models.length === 1 ? models[0] : models;
}

module.exports = { mainParser, modelParser, extractModelDefinitions, extractFields, extractTimestampFields };