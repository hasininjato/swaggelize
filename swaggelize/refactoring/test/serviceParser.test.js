const {readFileContent} = require("../src/utils/utils");
const {parseCollectionOperations, getModelName} = require("../src/parsers/serviceParser");
const yaml = require("js-yaml");
const serviceCollectionNoCustomContent = readFileContent("./refactoring/test/data/helpers/serviceParser/input/service.collection.nocustom.yaml");
const serviceCollectionWithCustomContent = readFileContent("./refactoring/test/data/helpers/serviceParser/input/service.collection.withcustom.yaml");

// Import input models
const serviceCollectionNoCustomContentYaml = yaml.load(serviceCollectionNoCustomContent);
const serviceCollectionWithCustomContentYaml = yaml.load(serviceCollectionWithCustomContent);

// Import expected results
const {
    serviceCollectionNoCustomExpectedResult,
    serviceCollectionWithCustomExpectedResult

} = require("./data/helpers/serviceParser/expected")

describe('service parser module', () => {
    it('extract service, get model name', () => {
        expect(getModelName(serviceCollectionNoCustomContentYaml)).toStrictEqual(["Tag"]);
    })

    it('extract service, collection operation without custom', () => {
        expect(parseCollectionOperations(serviceCollectionNoCustomContentYaml)).toStrictEqual(serviceCollectionNoCustomExpectedResult);
    })

    it('extract service, collection operation with custom', () => {
        expect(parseCollectionOperations(serviceCollectionWithCustomContentYaml)).toStrictEqual(serviceCollectionWithCustomExpectedResult);
    })
})