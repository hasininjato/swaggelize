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
    let sequelizeModelName = code.match(SEQUELIZE_DEFINE_PATTERN)?.[2] || null;

    // Fallback AST detection if regex fails
    if (!sequelizeModelName) {
        const visitor = {
            AssignmentExpression(path) {
                if (!sequelizeModelName &&
                    t.isMemberExpression(path.node.left) &&
                    path.node.left.property.name === 'define' &&
                    t.isIdentifier(path.node.left.object) &&
                    path.node.left.object.name === 'sequelize' &&
                    t.isIdentifier(path.node.right.id)) {
                    sequelizeModelName = path.node.right.id.name;
                    path.stop();
                }
            },
            VariableDeclarator(path) {
                if (!sequelizeModelName &&
                    t.isCallExpression(path.node.init) &&
                    t.isMemberExpression(path.node.init.callee) &&
                    path.node.init.callee.property.name === 'define' &&
                    t.isIdentifier(path.node.init.callee.object) &&
                    path.node.init.callee.object.name === 'sequelize' &&
                    t.isIdentifier(path.node.id)) {
                    sequelizeModelName = path.node.id.name;
                    path.stop();
                }
            }
        };
        traverse(ast, visitor);
    }

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
        value: swagComments,
    };
};

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
                args: path.node.expression.arguments.map(getValueFromNode),
            };
        }
    }

    return null;
}

module.exports = { modelParser };