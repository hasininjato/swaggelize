const {
    mainParser,
    extractFields,
    extractTimestampFields,
    modelParser, extractRelations, extractModelName
} = require("../src/parsers/modelParser");
const {profile} = require('./data/profile.model');
const {post} = require('./data/post.model');
const {user} = require('./data/user.model');
const {instrument} = require('./data/instrument.model');

const postModel = mainParser(post);
const profileModel = mainParser(profile);
const userModel = mainParser(user);
const instrumentModel = mainParser(instrument);
describe('model parser module', () => {
    it('extract sequelize model name', () => {
        postModel.forEach((element) => {
            expect(extractModelName(element)).toBe('Post');
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
            expect(extractTimestampFields(element)).not.toBe([])
        })
    })

    it('extract sequelize model fields with timestamps', () => {
        profileModel.forEach((element) => {
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
                }
            ],
            "options": {}
        });
    })

    it('extract model without relation', () => {
        userModel.forEach((element) => {
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

    it('extract model with one to many relation', () => {
        postModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual({
                "relations": [
                    {
                        "type": "relation",
                        "relation": "hasMany",
                        "source": "User",
                        "target": "Post",
                        "args": [
                            "Post",
                            {
                                "onDelete": "CASCADE",
                                "foreignKey": "postId",
                                "association": "Posts"
                            }
                        ]
                    }
                ]
            })
        })
    })

    it('extract model with many to many relation without creating new model through', () => {
        instrumentModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual({
                "relations": [
                    {
                        "type": "relation",
                        "relation": "belongsToMany",
                        "source": "User",
                        "target": "Instrument",
                        "args": [
                            "Instrument",
                            {
                                "through": "InstrumentUsers",
                                "association": "Instruments",
                                "foreignKey": "instrumentId"
                            }
                        ]
                    },
                    {
                        "type": "relation",
                        "relation": "belongsToMany",
                        "source": "Instrument",
                        "target": "User",
                        "args": [
                            "User",
                            {
                                "through": "InstrumentUsers",
                                "association": "Users",
                                "foreignKey": "userId"
                            }
                        ]
                    }
                ]
            })
        })
    })

});
