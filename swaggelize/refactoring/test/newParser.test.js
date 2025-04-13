const {
    traverseAst,
    extractFields,
    extractTimestampFields,
    extractRelations, extractModelName, extractThroughRelationWithFields, extractAst,
    createModelManyToManyThroughString,
    extractRelationsManyToManyThroughString,
    modelParser
} = require("../src/parsers/newParser");

// data models
const {profile} = require('./data/profile.model');
const {post} = require('./data/post.model');
const {user} = require('./data/user.model');
const {instrument} = require('./data/instrument.model');
const {postTag} = require('./data/post.tag.model');
const {twoModels} = require('./data/twoModels.model');

// extract AST
const profileAst = extractAst(profile);
const postAst = extractAst(post);
const userAst = extractAst(user);
const instrumentAst = extractAst(instrument);
const postTagAst = extractAst(postTag);
const twoModelsAst = extractAst(twoModels);

// ast traversed
const profileModel = traverseAst(profileAst)
const postModel = traverseAst(postAst);
const userModel = traverseAst(userAst);
const instrumentModel = traverseAst(instrumentAst);
const postTagModel = traverseAst(postTagAst);
const twoModelsModel = traverseAst(twoModelsAst);

// expected results
const {
    modelFieldsExpectedResult,
    modelFieldsWithTimeStampsExpectedResult,
    modelParserExpectedResult,
    modelOneToOneRelationExpectedResult,
    modelParserNoAssociationOneModelExpectedResult,
    twoModelsInOneFileExpectedResult
} = require('./data/helpers/modelParser/index');
const {
    modelOneToMannyRelationExpectedResult, modelManyToMannyRelationThroughIsStringExpectedResult,
    manyToMannyRelationThroughIsStringExpectedResult
} = require("./data/helpers/modelParser");
const newModelThroughIsString = require("./data/helpers/modelParser/expectedNewModelThroughIsString");

describe('model parser module', () => {
    it('extract sequelize model name', () => {
        postModel.forEach((element) => {
            expect(extractModelName(element)).toBe('Post');
        });
        userModel.forEach((element) => {
            expect(extractModelName(element)).toBe('User');
        });
    });

    it('extract model fields', () => {
        postModel.forEach((element) => {
            expect(extractFields(element)).toStrictEqual(modelFieldsExpectedResult)
        });
    });

    it('extract timestamps fields timestamps option is false', () => {
        postModel.forEach((element) => {
            expect(extractTimestampFields(element)).toStrictEqual([])
        })
    })

    it('extract timestamps fields timestamps option is true', () => {
        profileModel.forEach((element) => {
            expect(extractTimestampFields(element)).toStrictEqual(modelFieldsWithTimeStampsExpectedResult)
        })
    })

    it('extract model without relation', () => {
        userModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual({"relations": []})
        })
    })

    it('extract relations one to one', () => {
        profileModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual(modelOneToOneRelationExpectedResult)
        })
    })

    it('extract model with one to many relation', () => {
        postModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual(modelOneToMannyRelationExpectedResult)
        })
    })

    it('extract model with many to many relation through model is manually declared', () => {
        instrumentModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual(modelManyToMannyRelationThroughIsStringExpectedResult)
        })
    })

    it('extract through relations with fields in many to many relation when through relation is string', () => {
        expect(extractRelationsManyToManyThroughString(instrumentAst)).toStrictEqual(manyToMannyRelationThroughIsStringExpectedResult)
    })

    it('extract through relations with fields in many to many relation when through relation is string', () => {
        expect(extractRelationsManyToManyThroughString(postTagAst)).toStrictEqual([])
    })

    it('create through model for many to many relation from extractRelationsManyToManyThroughString through relation is string', () => {
        expect(createModelManyToManyThroughString(extractRelationsManyToManyThroughString(instrumentAst))).toStrictEqual(newModelThroughIsString)
    })

    // testing model parser function
    it('model parser, one sequelize model declared in one file, with timestamps, no relation', () => {
        expect(modelParser(user)).toStrictEqual(modelParserNoAssociationOneModelExpectedResult)
    })

    it('model parser, two sequelize models declared, no timestamps, no relation', () => {
        expect(modelParser(twoModels)).toStrictEqual(twoModelsInOneFileExpectedResult)
    })
});
