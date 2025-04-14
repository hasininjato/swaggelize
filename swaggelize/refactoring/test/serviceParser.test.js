const {readFileContent} = require("../src/utils/utils");
const {parseCollectionOperations, getModelName} = require("../src/parsers/serviceParser");
const yaml = require("js-yaml");
const serviceCollectionNoCustomContent = readFileContent("./refactoring/test/data/helpers/serviceParser/input/service.collection.nocustom.yaml");

// Import input models
const serviceYaml = yaml.load(serviceCollectionNoCustomContent);

// Import expected results
const {
    serviceCollectionNoCustomExpectedResult
} = require("./data/helpers/serviceParser/expected")

describe('service parser module', () => {
    it('extract service, get model name', () => {
        expect(getModelName(serviceYaml)).toStrictEqual(["Tag"]);
    })

    it('extract service, collection operation without custom', () => {
        expect(parseCollectionOperations(serviceYaml)).toStrictEqual(serviceCollectionNoCustomExpectedResult);
    })
})