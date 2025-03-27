const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const utils = require("./utils");

// Cache for common checks
const RELATION_METHODS = new Set(["hasOne", "hasMany", "belongsTo", "belongsToMany"]);

const getValueFromNode = (node) => {
    if (!node) return null;

    if (t.isIdentifier(node)) return node.name;
    if (t.isStringLiteral(node)) return node.value;
    if (t.isBooleanLiteral(node)) return node.value;
    if (t.isNumericLiteral(node)) return node.value;
    if (t.isMemberExpression(node)) return `${node.object.name}.${node.property.name}`;

    if (t.isObjectExpression(node)) {
        return node.properties.reduce((obj, prop) => {
            const key = prop.key.name || prop.key.value;
            obj[key] = getValueFromNode(prop.value);
            return obj;
        }, {});
    }

    if (t.isArrayExpression(node)) {
        return node.elements.map(getValueFromNode);
    }

    return null;
};

const modelParser = (code) => {
    const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
    });

    const swagComments = [];
    let sequelizeModelName = code.match(/const (\w+)\s*=\s*sequelize\.define/)?.[1] || null;

    // Fallback AST detection if regex fails
    if (!sequelizeModelName) {
        traverse(ast, {
            AssignmentExpression(path) {
                if (!sequelizeModelName &&
                    t.isMemberExpression(path.node.left) &&
                    path.node.left.property.name === 'define' &&
                    t.isIdentifier(path.node.left.object) &&
                    path.node.left.object.name === 'sequelize' &&
                    t.isIdentifier(path.node.right.id)) {
                    sequelizeModelName = path.node.right.id.name;
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
                }
            }
        });
    }

    traverse(ast, {
        enter(path) {
            if (!path.node.leadingComments) return;

            for (let i = path.node.leadingComments.length - 1; i >= 0; i--) {
                const comment = path.node.leadingComments[i];
                if (!comment.value.includes('@swag')) continue;

                let context = null;

                if (path.isObjectProperty() && path.parentPath.isObjectExpression()) {
                    context = {
                        field: path.node.key.name,
                        type: 'field',
                        object: getValueFromNode(path.node.value),
                    };
                }
                else if (path.isExpressionStatement() &&
                    t.isCallExpression(path.node.expression)) {
                    const { callee } = path.node.expression;

                    if (t.isMemberExpression(callee) &&
                        RELATION_METHODS.has(callee.property.name)) {
                        context = {
                            type: 'relation',
                            relation: callee.property.name,
                            args: path.node.expression.arguments.map(getValueFromNode),
                        };
                    }
                }

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

module.exports = { modelParser };