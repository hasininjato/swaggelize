const { getFileInDirectory, readFileContent } = require("../utils");
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
const { enhanceCollectionsWithBodyAndResponses } = require("./responseBodyCreator");
const fs = require("node:fs");

function servicesParser(servicePath, routesVariable, routePrefix, schemas, models) {
    const collectionJson = {};
    const servicesFiles = getFileInDirectory(servicePath);
    const customRoutesCollection = {};
    const customRoutesItems = {};

    let relationsComponents = {};
    let test = 1;

    models.forEach(model => {
        const relations = model.relations;
        relations.forEach(relation => {
            if (relation.relation === "hasOne") {
                const source = relation.source;
                const target = relation.target;
                const sourceComponentName = `${source}Item`;
                const targetComponentName = `${target}Item`;
                const schemaComponentName = `${source}${target}`;
                const foreignKey = target.toLowerCase() + 'Id';
                relationsComponents[schemaComponentName] = {
                    ...schemas.schemas[sourceComponentName]
                }
                relationsComponents[schemaComponentName].properties[foreignKey] = {
                    ...schemas.schemas[targetComponentName]
                }
            } else if (relation.relation === "hasMany") {
                const source = relation.source;
                const target = relation.target;
                const sourceComponentName = `${source}Item`;
                const targetComponentName = `${target}List`;
                const schemaComponentName = `${source}${target}`;
                const foreignKey = target.toLowerCase() + 'Id';
                relationsComponents[schemaComponentName] = {
                    ...schemas.schemas[sourceComponentName]
                }
                relationsComponents[schemaComponentName].properties[foreignKey] = {
                    ...schemas.schemas[targetComponentName]
                }
            } else if (relation.relation === "belongsToMany") {
                const source = relation.source;
                const target = relation.target;
                const sourceComponentNameItem = `${source}Item`;
                const targetComponentNameItem = `${target}List`;
                const foreignKeyTarget = target.toLowerCase() + 'Id';
                // update item schema of source and target component
                relationsComponents[sourceComponentNameItem] = {
                    ...schemas.schemas[sourceComponentNameItem]
                }
                // we add the targetComponentName to the sourceComponentName
                relationsComponents[sourceComponentNameItem].properties[foreignKeyTarget] = {
                    ...schemas.schemas[targetComponentNameItem]
                }
                // update list schema of source and target component
                const sourceComponentNameList = `${source}List`;
                const targetComponentNameList = `${target}List`;
                relationsComponents[sourceComponentNameList] = {
                    ...schemas.schemas[sourceComponentNameList]
                }
                relationsComponents[targetComponentNameList] = {
                    ...schemas.schemas[targetComponentNameList]
                }
                // remove circular structure to json
                if (test == 1) {
                    test++;
                    // First create copies of the schemas to avoid circular references
                    const userListCopy = JSON.parse(JSON.stringify(schemas.schemas[sourceComponentNameList]));
                    const instrumentListCopy = JSON.parse(JSON.stringify(schemas.schemas[targetComponentNameList]));

                    // Then add the references
                    const foreignKeySource = source.toLowerCase() + 'Id';
                    relationsComponents[sourceComponentNameList].items.properties[foreignKeyTarget] = instrumentListCopy;
                    relationsComponents[targetComponentNameList].items.properties[foreignKeySource] = userListCopy;
                }
            }
        });
    });
    // fs.writeFileSync("relations.json", JSON.stringify(relationsComponents, null, 4));

    servicesFiles.forEach((file) => {
        const contentYaml = readFileContent(`${servicePath}/${file}`);
        const parsedYaml = yaml.load(contentYaml);
        const routes = getEndPointsApi(routesVariable);
        const [model] = Object.keys(parsedYaml);
        const modelLower = model.toLowerCase();
        const { collectionOperations, itemOperations } = parsedYaml[model];

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

module.exports = { servicesParser };