const {
    mainParser,
    extractFields,
    extractTimestampFields,
    modelParser, extractRelations, extractModelName, extractThroughRelationWithFields, extractAst,
    createThroughModelIfString
} = require("../src/parsers/modelParser");

// data models
const {
    profile,
    post,
    user,
    instrument,
    postTag
} = require('./data')

// main parser
const postModel = mainParser(post);
const profileModel = mainParser(profile);
const userModel = mainParser(user);
const instrumentModel = mainParser(instrument);

// ast
const astInstrumentModel = extractAst(instrument);
const astPostTag = extractAst(postTag);

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
        expect(extractThroughRelationWithFields(astInstrumentModel)).toStrictEqual(manyToMannyRelationThroughIsStringExpectedResult)
    })

    it('extract through relation with fields through relation is object', () => {
        expect(extractThroughRelationWithFields(astPostTag)).toStrictEqual([])
    })

    it('create through model through relation is string', () => {
        expect(createThroughModelIfString(extractThroughRelationWithFields(astInstrumentModel))).toStrictEqual(newModelThroughIsString)
    })
});
