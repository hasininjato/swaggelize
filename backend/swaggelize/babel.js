const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const fs = require("fs");

const code = `
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const User = require('./user.model');

const Test = sequelize.define('Test', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    /**
     * @swag
     * methods: item, list, put, post
     * description: Amount of the transaction
     */
    amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        unique: false,
        validate: {
            notNull: { msg: "Amount is required" },
            isDecimal: { msg: "Amount must be a valid decimal number" },
            notEmpty: { msg: "Amount cannot be empty" },
            min: {
                args: [0.01],
                msg: "Amount must be greater than 0"
            }
        }
    },
    /**
     * @swag
     * methods: item, list, put, post
     * description: Description of the transaction
     */
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        validate: {
            notNull: { msg: "Description is required" },
            notEmpty: { msg: "Description cannot be empty" }
        }
    },
    /**
     * @swag
     * methods: item, list
     */
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true
});

/**
 * @swag
 * join: ManyToOne
 * foreignKey: userId
 * methods: item, list, put, post
 */
User.belongsToMany(Test, { through: 'UserTest' });
Test.belongsToMany(User, { through: 'UserTest' });

module.exports = Test;
`;

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
                            type: 'field',
                            field: fieldName,
                            object: fieldObject,
                        };
                    }
                    // Check if the comment is associated with a relation (hasMany or belongsTo)
                    else if (path.isExpressionStatement()) {
                        const expression = path.node.expression;

                        if (t.isCallExpression(expression)) {
                            const callee = expression.callee;

                            const relations = ["hasOne", "hasMany", "belongsTo", "belongsToMany"];
                            console.log(callee.property.name, t.isMemberExpression(callee), callee.property.name.includes(relations))
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

                    if (context) {
                        swagComments.push({
                            comment: comment.value.trim(),
                            ...context,
                        });
                    }
                }
            });
        }
    }
});

// console.log(JSON.stringify(swagComments, null, 2));
fs.writeFileSync("swaggelize/test.json", JSON.stringify(swagComments, null, 4))