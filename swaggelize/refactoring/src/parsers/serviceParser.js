const yaml = require("js-yaml");

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
 * @returns {{default: {}, custom: {}}|null}
 */
function parseCollectionOperations(service) {
    const operations = { default: {}, custom: {} };
    const [model] = getModelName(service);
    const modelNameLower = model.toLowerCase();
    const { collectionOperations } = service[model];
    if (collectionOperations) {
        Object.entries(collectionOperations)?.forEach(([method, details]) => {
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
    return null;
}

function parseItemOperations(service) {
    const operations = { default: {}, custom: {} };
    const [model] = getModelName(service);
    const modelNameLower = model.toLowerCase();
    const { itemOperations } = service[model];

    if (itemOperations) {
        Object.entries(itemOperations)?.forEach(([method, details]) => {
            const routeData = {
                summary: details.openapi_context.summary,
                description: details.openapi_context.description,
                tags: details.tags ?? model,
            };

            if (['put', 'get', 'delete'].includes(method)) {
                const route = `/${modelNameLower}s/{id}`;
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
    return null;
}

/**
 * parse service yaml file
 * @param content
 * @returns {{collectionOperations: {default: {}, custom: {}}, itemOperations: {default: {}, custom: {}}}}
 */
function serviceParser(content) {
    const parsedYaml = yaml.load(content);

    const collectionOperations = parseCollectionOperations(parsedYaml);
    const itemOperations = parseItemOperations(parsedYaml);
    return {
        collectionOperations,
        itemOperations
    };
}

module.exports = {
    serviceParser,
    parseCollectionOperations,
    getModelName,
    parseItemOperations
};