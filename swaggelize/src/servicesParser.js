const utils = require("./utils");
const yaml = require('js-yaml');
const listEndpoints = require('express-list-endpoints');

// Pre-compiled regex patterns
const COLLECTION_ROUTE_PATTERN_CACHE = new Map();
const ITEM_ROUTE_PATTERN_CACHE = new Map();
const PATH_PARAM_REGEX = /{([^}]+)}/g;
const INSERT_METHODS = new Set(["post", "put", "patch"]);
const METHOD_RESPONSE_CODES = {
    post: 201,
    get: 200,
    put: 200,
    patch: 200,
    delete: 204
};

// Standard responses definition
const STANDARD_RESPONSES = {
    400: { description: "Bad request" },
    404: { description: "Not found" },
    500: { description: "Internal server error" }
};

const servicesParser = (servicePath, routesVariable, routePrefix, schemas) => {
    const collectionJson = {};
    const servicesFiles = utils.getFileInDirectory(servicePath);

    servicesFiles.forEach((file) => {
        const contentYaml = utils.readFileContent(`${servicePath}/${file}`);
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

        routes.forEach((route) => {
            let routeWithoutPrefix, operations, isCollectionRoute, paramName;

            if (collectionRoutePattern.test(route.path)) {
                routeWithoutPrefix = route.path.replace(routePrefix, "");
                operations = collectionOperations;
                isCollectionRoute = true;
            } else if (itemRoutePattern.test(route.path)) {
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

    enhanceCollectionsWithBodyAndResponses(collectionJson);
    return collectionJson;
};

function getCachedPattern(cache, pattern) {
    if (!cache.has(pattern)) {
        cache.set(pattern, new RegExp(pattern));
    }
    return cache.get(pattern);
}

function processRouteMethods(methods, operations, routeEntry, isCollectionRoute, paramName, model) {
    methods.forEach((method) => {
        const methodLower = method.toLowerCase();
        const operationMethod = operations[methodLower];
        if (!operationMethod) return;

        const operationData = {
            summary: operationMethod.openapi_context?.summary,
            description: operationMethod.openapi_context?.description,
            output: operationMethod.output || []
        };

        if (!isCollectionRoute) {
            operationData.parameters = [generateParameter(paramName, model)];
        }

        if ((isCollectionRoute && methodLower === "post") || INSERT_METHODS.has(methodLower)) {
            operationData.input = operationMethod.input || [];
        }

        routeEntry[methodLower] = operationData;
    });
}

const generateParameter = (parameterName, model) => ({
    in: "path",
    name: parameterName,
    schema: { type: "string" },
    required: true,
    description: `${model} ${parameterName}`
});

const enhanceCollectionsWithBodyAndResponses = (collections) => {
    Object.entries(collections).forEach(([route, methods]) => {
        Object.entries(methods).forEach(([method, operation]) => {
            // Add request body if needed
            if (INSERT_METHODS.has(method) && operation.input?.length) {
                operation.requestBody = createRequestBody(operation.input[0]);
            }

            // Add responses
            operation.responses = createResponses(
                method,
                operation.output,
                route.match(PATH_PARAM_REGEX) !== null,
                INSERT_METHODS.has(method)
            );
        });
    });
};

function createRequestBody(input) {
    const { pascalCase } = transformStr(input);
    return {
        content: {
            "application/json": {
                schema: { $ref: `#/components/schemas/${pascalCase}` }
            }
        }
    };
}

function createResponses(method, output, hasPathParams, isModifyingMethod) {
    const responses = { ...STANDARD_RESPONSES };
    const statusCode = METHOD_RESPONSE_CODES[method] || 200;

    if (statusCode === 204) {
        responses[204] = { description: "Deleted" };
        return responses;
    }

    if (!output?.length) return responses;

    const { pascalCase, prefix } = transformStr(output[0]);
    const description = method === "post"
        ? `Created ${prefix}`
        : `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${output[0].split(':')[1] || ''}`;

    responses[statusCode] = {
        description,
        content: {
            "application/json": {
                schema: { $ref: `#/components/schemas/${pascalCase}` }
            }
        }
    };

    if (hasPathParams) {
        responses[404] = STANDARD_RESPONSES[404];
    }

    if (isModifyingMethod) {
        responses[400] = STANDARD_RESPONSES[400];
    }

    return responses;
}

const transformStr = (input) => {
    const [prefix, suffix] = input.split(':');
    const pascalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const pascalCase = suffix
        ? pascalPrefix + suffix.charAt(0).toUpperCase() + suffix.slice(1)
        : pascalPrefix;

    return { pascalCase, suffix, prefix };
};

const getEndPointsApi = (app) => listEndpoints(app);

module.exports = { servicesParser };