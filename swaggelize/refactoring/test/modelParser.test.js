const {mainParser, extractModelDefinitions, extractFields, extractTimestampFields} = require("../src/parsers/modelParser");

const code = `
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const User = require('./user.model');

const Post = sequelize.define('Post', {
    /**
     * @swag
     * description: Post title
     * methods: list, item, put, post
     */
    title: DataTypes.STRING,
    /**
     * @swag
     * description: Post content
     * methods: list, item, put, post
     */
    content: DataTypes.TEXT,
}, {
    timestamps: true
});

module.exports = {Post};
`;

const parsedModel = mainParser(code);
describe('model parser module', () => {
    it('extract sequelize model name', () => {
        parsedModel.forEach((element) => {
            expect(extractModelDefinitions(element)).toBe('Post');
        });
    });

    it('extract sequelize model fields', () => {
        parsedModel.forEach((element) => {
            expect(extractFields(element)).toStrictEqual([
                {
                    "field": "title",
                    "type": "field",
                    "object": "DataTypes.STRING",
                    "comment": {
                        "methods": [
                            "list",
                            "item",
                            "put",
                            "post"
                        ],
                        "description": "Post title"
                    }
                },
                {
                    "field": "content",
                    "type": "field",
                    "object": "DataTypes.TEXT",
                    "comment": {
                        "methods": [
                            "list",
                            "item",
                            "put",
                            "post"
                        ],
                        "description": "Post content"
                    }
                }
            ])
        })
    });

    it('extract sequelize model fields without timestamps', () => {
        parsedModel.forEach((element) => {
            expect(extractTimestampFields(element)).not.toStrictEqual([])
        })
    })

    it('extract sequelize model fields with timestamps', () => {
        parsedModel.forEach((element) => {
            expect(extractTimestampFields(element)).toStrictEqual([
                {
                    "field": "createdAt",
                    "type": "field",
                    "object": {
                        "type": "DataTypes.DATE",
                        "allowNull": false
                    },
                    "comment": {
                        "methods": [
                            "item",
                            "list"
                        ],
                        "description": "Date when the record was created"
                    }
                },
                {
                    "field": "updatedAt",
                    "type": "field",
                    "object": {
                        "type": "DataTypes.DATE",
                        "allowNull": false
                    },
                    "comment": {
                        "methods": [
                            "item",
                            "list"
                        ],
                        "description": "Date when the record was last updated"
                    }
                }
            ])
        })
    })
});
