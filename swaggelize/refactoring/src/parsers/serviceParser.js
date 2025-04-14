const yaml = require("js-yaml");
const {readFileContent} = require("../../../old/src/utils");
const {assertClassAccessorProperty} = require("@babel/types");

/**
 * extract the model name from the service file
 * @param content
 * @returns {string[]}
 */
function getModelName(content) {
    return Object.keys(content)
}

/**
 * parse collection operations in service yaml file
 * @param service
 * @returns {{default: {}, custom: {}}}
 */
function parseCollectionOperations(service) {
    const operations = {default: {}, custom: {}};
    const [model] = getModelName(service);
    const modelNameLower = model.toLowerCase();
    const {collectionOperations} = service[model];

    Object.entries(collectionOperations).forEach(([method, details]) => {
        const routeData = {
            summary: details.openapi_context.summary,
            description: details.openapi_context.description,
            tags: details.tags ?? model,
        };

        if (['post', 'get'].includes(method)) {
            const route = `/${modelNameLower}s`;
            if (!operations["default"][route]) {
                operations["default"][route] = {};
            }
            operations["default"][route][method] = routeData;
        } else {
            const route = details.path;
            if (!operations["custom"][route]) {
                operations["custom"][route] = {};
            }
            const customMethod = details.method.toLowerCase();
            operations["custom"][route][customMethod] = routeData;
        }
    });

    return operations;
}

/**
 * parse service yaml file
 * @param content
 * @returns {{default: {}, custom: {}}}
 */
function serviceParser(content) {
    const parsedYaml = yaml.load(content);

    console.log(JSON.stringify(parseCollectionOperations(parsedYaml), null, 4));
    return parseCollectionOperations(parsedYaml);
}

module.exports = {
    serviceParser,
    parseCollectionOperations,
    getModelName
};