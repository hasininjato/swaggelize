const {
    traverseAst,
    extractFields,
    extractTimestampFields,
    modelParser, extractRelations, extractModelName, extractThroughRelationWithFields, extractAst,
    createThroughModelIfString
} = require("../src/parsers/newParser");

// data models
const { profile } = require('./data/profile.model');
const { post } = require('./data/post.model');
const { user } = require('./data/user.model');
const { instrument } = require('./data/instrument.model');
const { postTag } = require('./data/post.tag.model');

// extract AST
const profileAst = extractAst(profile);
const postAst = extractAst(post);
const userAst = extractAst(user);
const instrumentAst = extractAst(instrument);
const postTagAst = extractAst(postTag);

// ast traversed
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
        userModel.forEach((element) => {
            expect(extractModelName(element)).toBe('User');
        });
    });

    it('extract model fields without sequelize', () => {
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
});
