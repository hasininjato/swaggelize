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

function parseCollectionOperations(contentCollectionOperations, routePrefix, modelName, operations) {
    const modelNameLower = modelName.toLowerCase();
    Object.entries(contentCollectionOperations).forEach((key, value) => {
        const routeData = {
            summary: key[1].openapi_context.summary,
            description: key[1].openapi_context.description,
            tags: key[1].tags ?? modelName,
        };
        if (['post', 'get'].includes(key[0])) {
            const route = `/${modelNameLower}s`
            // default routes
            const method = key[0];

            if (!operations["default"]) {
                operations["default"] = {};
            }
            if (!operations["default"][route]) {
                operations["default"][route] = {};
            }
            // Add the method under the route
            operations["default"][route][method] = routeData;
        } else {
            const route = key[1].path;
            if (!operations["custom"]) {
                operations["custom"] = {};
            }
            if (!operations["custom"][route]) {
                operations["custom"][route] = {};
            }
            // Add the method under the route
            const method = key[1].method.toLowerCase();
            operations["custom"][route][method] = routeData;
        }
    })
}

function serviceParser(file, routePrefix, operations) {
    const contentYaml = readFileContent(file);
    const parsedYaml = yaml.load(contentYaml);
    const [model] = getModelName(parsedYaml)
    const {collectionOperations, itemOperations} = parsedYaml[model];
    parseCollectionOperations(collectionOperations, routePrefix, model, operations);
}

module.exports = serviceParser;