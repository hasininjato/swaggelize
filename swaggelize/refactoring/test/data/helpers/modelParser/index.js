const modelFieldsExpectedResult = require("./expectedModelFields");
const modelFieldsWithTimeStampsExpectedResult = require("./expectedModelFieldsWithTimeStamps");
const modelParserExpectedResult = require("./expectedModelParser");
const modelOneToOneRelationExpectedResult = require("./expectedOneToOneRelation");
const modelOneToMannyRelationExpectedResult = require("./expectedOneToManyRelation");
const modelManyToMannyRelationThroughIsStringExpectedResult = require("./expectedManyToManyRelationThroughIsString");
const manyToMannyRelationThroughIsStringExpectedResult = require("./expectedThroughIsStringRelationWithFields");

module.exports = {
    modelFieldsExpectedResult,
    modelFieldsWithTimeStampsExpectedResult,
    modelParserExpectedResult,
    modelOneToOneRelationExpectedResult,
    modelOneToMannyRelationExpectedResult,
    modelManyToMannyRelationThroughIsStringExpectedResult,
    manyToMannyRelationThroughIsStringExpectedResult
};