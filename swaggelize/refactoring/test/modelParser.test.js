const {
    mainParser,
    extractModelDefinitions,
    extractFields,
    extractTimestampFields,
    modelParser, extractRelations
} = require("../src/parsers/modelParser");
const {profile} = require('./data/profile.model.test');
const {post} = require('./data/post.model.test');

const postModel = mainParser(post);
const profileModel = mainParser(profile);
describe('model parser module', () => {
    it('extract sequelize model name', () => {
        postModel.forEach((element) => {
            expect(extractModelDefinitions(element)).toBe('Post');
        });
    });

    it('extract sequelize model fields', () => {
        postModel.forEach((element) => {
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
        postModel.forEach((element) => {
            expect(extractTimestampFields(element)).not.toStrictEqual([])
        })
    })

    it('extract sequelize model fields with timestamps', () => {
        postModel.forEach((element) => {
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
    });

    it('extract model parser', () => {
        expect(modelParser(post)).toStrictEqual({
            "sequelizeModel": "Post",
            "value": [
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
                },
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
            ],
            "options": {
                "timestamps": true
            }
        });
    })

    it('extract model without relation', () => {
        postModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual({"relations": []})
        })
    })

    it('extract model with one to one relation', () => {
        profileModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual({
                    "relations": [
                        {
                            "type": "relation",
                            "relation": "hasOne",
                            "source": "User",
                            "target": "Profile",
                            "args": [
                                "Profile",
                                {
                                    "foreignKey": "profileId"
                                }
                            ]
                        }
                    ]
                }
            )
        })
    })
});
