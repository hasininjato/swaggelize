const {
    traverseAst,
    extractFields,
    extractTimestampFields,
    modelParser, extractRelations, extractModelName, extractThroughRelationWithFields, extractAst,
    createThroughModelIfString
} = require("../src/parsers/newParser");

// data models
const {profile} = require('./data/profile.model');
const {post} = require('./data/post.model');
const {user} = require('./data/user.model');
const {instrument} = require('./data/instrument.model');
const {postTag} = require('./data/post.tag.model');

// extract AST
const profileAst = extractAst(profile);
const postAst = extractAst(post);
const userAst = extractAst(user);
const instrumentAst = extractAst(instrument);
const postTagAst = extractAst(postTag);

const profileModel = traverseAst(profileAst)
const postModel = traverseAst(postAst);
const userModel = traverseAst(userAst);
const instrumentModel = traverseAst(instrumentAst);
const postTagModel = traverseAst(postTagAst);

// expected results
const {
    modelFieldsExpectedResult,
    modelFieldsWithTimeStampsExpectedResult,
    modelParserExpectedResult,
    modelOneToOneRelationExpectedResult
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
    });

    it('extract sequelize model fields', () => {
        postModel.forEach((element) => {
            expect(extractFields(element)).toStrictEqual(modelFieldsExpectedResult)
        })
    });

    it('extract sequelize model fields without timestamps', () => {
        postModel.forEach((element) => {
            expect(extractTimestampFields(element)).not.toBe([])
        })
    })

    it('extract sequelize model fields with timestamps', () => {
        profileModel.forEach((element) => {
            expect(extractTimestampFields(element)).toStrictEqual(modelFieldsWithTimeStampsExpectedResult)
        })
    });

    it('extract model parser', () => {
        expect(modelParser(post)).toStrictEqual(modelParserExpectedResult);
    })

    it('extract model without relation', () => {
        userModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual({"relations": []})
        })
    })

    it('extract model with one to one relation', () => {
        profileModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual(modelOneToOneRelationExpectedResult)
        })
    })

    it('extract model with one to many relation', () => {
        postModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual(modelOneToMannyRelationExpectedResult)
        })
    })

    it('extract model with many to many relation without creating new model through', () => {
        instrumentModel.forEach((element) => {
            expect(extractRelations(element)).toStrictEqual(modelManyToMannyRelationThroughIsStringExpectedResult)
        })
    })

    it('extract through relation with fields through relation is string', () => {
        expect(extractThroughRelationWithFields(instrumentAst)).toStrictEqual(manyToMannyRelationThroughIsStringExpectedResult)
    })

    it('extract through relation with fields through relation is object', () => {
        expect(extractThroughRelationWithFields(postTagAst)).toStrictEqual([])
    })

    it('create through model through relation is string', () => {
        expect(createThroughModelIfString(extractThroughRelationWithFields(instrumentAst))).toStrictEqual(newModelThroughIsString)
    })
});
