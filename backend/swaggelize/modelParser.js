const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const utils = require("./utils");

const modelParser = (code) => {
    const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
    });

    const swagComments = [];

    // Helper function to convert AST node to plain JavaScript value
    const getValueFromNode = (node) => {
        if (t.isIdentifier(node)) {
            return node.name; // e.g., DataTypes.DECIMAL -> "DECIMAL"
        } else if (t.isStringLiteral(node)) {
            return node.value; // e.g., "Amount is required"
        } else if (t.isBooleanLiteral(node)) {
            return node.value; // e.g., true or false
        } else if (t.isNumericLiteral(node)) {
            return node.value; // e.g., 0.01
        } else if (t.isObjectExpression(node)) {
            const obj = {};
            node.properties.forEach(prop => {
                obj[prop.key.name || prop.key.value] = getValueFromNode(prop.value);
            });
            return obj;
        } else if (t.isArrayExpression(node)) {
            return node.elements.map(element => getValueFromNode(element));
        } else if (t.isMemberExpression(node)) {
            return `${node.object.name}.${node.property.name}`; // e.g., DataTypes.NOW
        }
        return null;
    };

    // Traverse the AST to extract @swag comments and their context
    traverse(ast, {
        enter(path) {
            // Check for leading comments on any node
            if (path.node.leadingComments) {
                path.node.leadingComments.forEach(comment => {
                    if (comment.value.includes('@swag')) {
                        let context = null;

                        // Check if the comment is associated with a field inside Transaction
                        if (path.isObjectProperty() && path.parentPath.isObjectExpression()) {
                            const fieldName = path.node.key.name;
                            const fieldProperties = path.node.value.properties;

                            // Extract field properties as a plain object
                            const fieldObject = {};
                            fieldProperties.forEach(prop => {
                                const key = prop.key.name || prop.key.value;
                                const value = getValueFromNode(prop.value);
                                fieldObject[key] = value;
                            });

                            context = {
                                field: fieldName,
                                type: 'field',
                                object: fieldObject,
                            };
                        }
                        // Check if the comment is associated with a relation (hasMany or belongsTo)
                        else if (path.isExpressionStatement()) {
                            const expression = path.node.expression;

                            if (t.isCallExpression(expression)) {
                                const callee = expression.callee;

                                const relations = ["hasOne", "hasMany", "belongsTo", "belongsToMany"];
                                if (
                                    t.isMemberExpression(callee) &&
                                    relations.includes(callee.property.name)
                                ) {
                                    const args = expression.arguments;
                                    context = {
                                        type: 'relation',
                                        relation: callee.property.name, // e.g., "hasMany" or "belongsTo"
                                        args: args.map(arg => getValueFromNode(arg)),
                                    };
                                }
                            }
                        }
                        const { methods, description } = utils.getMethodsAndDescriptionFromComment(comment.value.trim());
                        // console.log(methods, description)

                        if (context) {
                            swagComments.push({
                                ...context,
                                comment: {
                                    methods: methods,
                                    description: description
                                },
                            });
                        }
                    }
                });
            }
        }
    });

    const sequelizeModelName = code.match(/const (\w+)\s*=\s*sequelize\.define/);

    return {
        sequelizeModel: sequelizeModelName[1],
        value: swagComments
    };

    return swagComments;
}

module.exports = { modelParser };