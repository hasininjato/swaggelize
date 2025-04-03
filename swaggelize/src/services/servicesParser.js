const {getFileInDirectory, readFileContent} = require("../utils");
const yaml = require('js-yaml');
const {
    getEndPointsApi,
    parseCustomRoutes,
    processRouteMethods
} = require('./routesParser');
const {
    COLLECTION_ROUTE_PATTERN_CACHE,
    ITEM_ROUTE_PATTERN_CACHE
} = require('./constants');
const {enhanceCollectionsWithBodyAndResponses} = require("./responseBodyCreator");

function servicesParser(servicePath, routesVariable, routePrefix, schemas) {
    const collectionJson = {};
    const servicesFiles = getFileInDirectory(servicePath);
    const customRoutesCollection = {};
    const customRoutesItems = {};

    servicesFiles.forEach((file) => {
        const contentYaml = readFileContent(`${servicePath}/${file}`);
        const parsedYaml = yaml.load(contentYaml);
        const routes = getEndPointsApi(routesVariable);
        const [model] = Object.keys(parsedYaml);
        const modelLower = model.toLowerCase();
        const {collectionOperations, itemOperations} = parsedYaml[model];

        // Cache regex patterns
        const collectionRoutePattern = getCachedPattern(
            COLLECTION_ROUTE_PATTERN_CACHE,
            `^${routePrefix}/${modelLower}s?$`
        );
        const itemRoutePattern = getCachedPattern(
            ITEM_ROUTE_PATTERN_CACHE,
            `^${routePrefix}/${modelLower}s?/:([^/]+)$`
        );

        const allowedMethodOperation = ['post', 'get'];
        const allowedMethodItem = ['put', 'get', 'patch', 'delete'];
        Object.keys(collectionOperations).filter(key => !allowedMethodOperation.includes(key)).forEach(operation => {
            customRoutesCollection[operation] = collectionOperations[operation] || [];
        });
        Object.keys(itemOperations).filter(key => !allowedMethodItem.includes(key)).forEach(operation => {
            customRoutesItems[operation] = itemOperations[operation] || [];
        });

        routes.forEach((route) => {
            let routeWithoutPrefix, operations, isCollectionRoute, paramName;

            if (collectionRoutePattern.test(route.path)) {
                // get basic collections operations (get all and post)
                routeWithoutPrefix = route.path.replace(routePrefix, "");
                operations = collectionOperations;
                isCollectionRoute = true;
            } else if (itemRoutePattern.test(route.path)) {
                // get basic item operations (get by id, delete, put and patch)
                paramName = route.path.split(":")[1];
                routeWithoutPrefix = route.path.replace(routePrefix, "").replace(`:${paramName}`, `{${paramName}}`);
                operations = itemOperations;
                isCollectionRoute = false;
            } else {
                return; // Skip if route doesn't match
            }

            if (!collectionJson[routeWithoutPrefix]) {
                collectionJson[routeWithoutPrefix] = {};
            }

            processRouteMethods(
                route.methods,
                operations,
                collectionJson[routeWithoutPrefix],
                isCollectionRoute,
                paramName,
                model
            );
        });
    });
    parseCustomRoutes(customRoutesItems, customRoutesCollection, collectionJson);
    enhanceCollectionsWithBodyAndResponses(collectionJson, schemas);
    return collectionJson;
}

function getCachedPattern(cache, pattern) {
    if (!cache.has(pattern)) {
        cache.set(pattern, new RegExp(pattern));
    }
    return cache.get(pattern);
}

module.exports = {servicesParser};