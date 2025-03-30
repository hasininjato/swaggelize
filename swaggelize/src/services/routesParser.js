const listEndpoints = require("express-list-endpoints");
const {INSERT_METHODS} = require("./constants");

const getEndPointsApi = (app) => {
    return listEndpoints(app)
}

const parseCustomRoutes = (customItemOperations, customCollectionOperations, collectionJson) => {
    const processOperation = (operation) => {
        collectionJson[operation.path] = collectionJson[operation.path] || {};
        collectionJson[operation.path][operation.method.toLowerCase()] = {
            summary: operation.openapi_context.summary,
            description: operation.openapi_context.description,
            ...(operation.input?.length && {input: operation.input})
        };
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