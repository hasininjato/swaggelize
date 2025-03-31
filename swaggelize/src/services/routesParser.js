const listEndpoints = require("express-list-endpoints");
const {INSERT_METHODS} = require("./constants");

const getEndPointsApi = (app) => {
    return listEndpoints(app)
}

const getVariablesFromPath = (path) => {
    const matches = [...path.matchAll(/\{([^}]+)}/g)];
    return matches.map(match => match[1]);
}

const isEmptyObject = (obj) => {
    return obj != null && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

const parseCustomRoutes = (customItemOperations, customCollectionOperations, collectionJson) => {
    const processOperation = (operation) => {
        const path = operation.path;
        const variables = getVariablesFromPath(path);
        let parameters = {};
        variables.forEach((variable) => {
            parameters = {
                ...parameters,
                ...generateParameter(variable, "")
            }
        });
        collectionJson[operation.path] = collectionJson[operation.path] || {};
        collectionJson[operation.path][operation.method.toLowerCase()] = {
            summary: operation.openapi_context.summary,
            tags: [operation.tags],
            description: operation.openapi_context.description,
            output: operation.output || [],
            ...(operation.input?.length && {input: operation.input})
        };
        if (!isEmptyObject(parameters)) {
            collectionJson[operation.path][operation.method.toLowerCase()]["parameters"] = [parameters];
        }
        const methodLower = operation.method.toLowerCase();

        if (INSERT_METHODS.has(methodLower)) {
            collectionJson[operation.path][operation.method.toLowerCase()]["input"] = operation.input || [];
        }
    };

    Object.values(customItemOperations).forEach(processOperation);
    Object.values(customCollectionOperations).forEach(processOperation);
}

const generateParameter = (parameterName, model) => {
    return {
        in: "path",
        name: parameterName,
        schema: {type: "string"},
        required: true,
        description: `${model} ${parameterName}`
    };
}

const processRouteMethods = (methods, operations, routeEntry, isCollectionRoute, paramName, model) => {
    methods.forEach((method) => {
        const methodLower = method.toLowerCase();
        const operationMethod = operations[methodLower];
        if (!operationMethod) return;

        const operationData = {
            summary: operationMethod.openapi_context?.summary,
            tags: [model],
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

module.exports = {
    getEndPointsApi,
    parseCustomRoutes,
    processRouteMethods
};