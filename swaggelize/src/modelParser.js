const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const utils = require("./utils");

// Cache for common checks and values
const RELATION_METHODS = new Set(["hasOne", "hasMany", "belongsTo", "belongsToMany"]);
const SEQUELIZE_DEFINE_PATTERN = /(?:const\s+(\w+)\s*=\s*)?sequelize\.define\(\s*['"](\w+)['"]/;
const SWAG_TAG = '@swag';

// Predefined node handlers for value extraction
const NODE_HANDLERS = {
    Identifier: node => node.name,
    StringLiteral: node => node.value,
    BooleanLiteral: node => node.value,
    NumericLiteral: node => node.value,
    MemberExpression: node => `${node.object.name}.${node.property.name}`,
    ObjectExpression: node => node.properties.reduce((obj, prop) => {
        const key = prop.key.name || prop.key.value;
        obj[key] = getValueFromNode(prop.value);
        return obj;
    }, {}),
    ArrayExpression: node => node.elements.map(getValueFromNode)
};

const getValueFromNode = (node) => {
    if (!node) return null;
    const handler = NODE_HANDLERS[node.type];
    return handler ? handler(node) : null;
};

const modelParser = (code) => {
    const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
    });

    const swagComments = [];
    const allRelations = [];  // <-- New: Store ALL relations here
    let sequelizeModelName = code.match(SEQUELIZE_DEFINE_PATTERN)?.[2] || null;

    // [Keep existing model name detection logic...]

    // First pass: Find ALL relations (regardless of comments)
    traverse(ast, {
        CallExpression(path) {
            const { callee } = path.node;
            if (t.isMemberExpression(callee) && RELATION_METHODS.has(callee.property.name)) {
                const source = callee.object.name;
                const target = path.node.arguments[0]?.name;
                
                allRelations.push({
                    type: 'relation',
                    relation: callee.property.name,
                    source,
                    target,
                    args: path.node.arguments.map(getValueFromNode),
                });
            }
        }
    });

    // Second pass: Find Swagger-annotated fields/relations (original logic)
    traverse(ast, {
        enter(path) {
            const { leadingComments } = path.node;
            if (!leadingComments) return;

            for (let i = leadingComments.length - 1; i >= 0; i--) {
                const comment = leadingComments[i];
                if (!comment.value.includes(SWAG_TAG)) continue;

                const context = getContextFromPath(path);
                if (context) {
                    const { methods, description } = utils.getMethodsAndDescriptionFromComment(comment.value.trim());
                    swagComments.push({
                        ...context,
                        comment: { methods, description },
                    });
                }
            }
        }
    });

    return {
        sequelizeModel: sequelizeModelName,
        value: swagComments,  // Fields/relations WITH Swagger comments
        relations: allRelations,  // ALL relations (with or without comments)
    };
};

// Updated getContextFromPath to include source/target for relations
const getContextFromPath = (path) => {
    if (path.isObjectProperty() && path.parentPath.isObjectExpression()) {
        return {
            field: path.node.key.name,
            type: 'field',
            object: getValueFromNode(path.node.value),
        };
    }

    if (path.isExpressionStatement() && t.isCallExpression(path.node.expression)) {
        const { callee } = path.node.expression;
        if (t.isMemberExpression(callee) && RELATION_METHODS.has(callee.property.name)) {
            return {
                type: 'relation',
                relation: callee.property.name,
                source: callee.object.name,  // <-- Added
                target: path.node.expression.arguments[0]?.name,  // <-- Added
                args: path.node.expression.arguments.map(getValueFromNode),
            };
        }
    }

    return null;
};

module.exports = { modelParser };