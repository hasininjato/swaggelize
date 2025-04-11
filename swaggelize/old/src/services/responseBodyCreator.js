const {METHOD_RESPONSE_CODES, STANDARD_RESPONSES, INSERT_METHODS, PATH_PARAM_REGEX} = require("./constants");
const {transformStr} = require("../utils");

const createResponses = (method, output, hasPathParams, isModifyingMethod) => {
    const responses = {...STANDARD_RESPONSES};
    const statusCode = METHOD_RESPONSE_CODES[method] || 200;

    if (statusCode === 204) {
        responses[204] = {description: "Deleted"};
        return responses;
    }

    if (!output?.length) return responses;

    const {pascalCase, prefix} = transformStr(output[0]);
    const description = method === "post"
        ? `Created ${prefix}`
        : `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${output[0].split(':')[1] || ''}`;

    responses[statusCode] = {
        description,
        content: {
            "application/json": {
                schema: {$ref: `#/components/schemas/${pascalCase}`}
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

const createRequestBody = (input) => {
    const {pascalCase} = transformStr(input);
    return {
        content: {
            "application/json": {
                schema: {$ref: `#/components/schemas/${pascalCase}`}
            }
        }
    };
}

const enhanceCollectionsWithBodyAndResponses = (collections, schemas) => {
    Object.entries(collections).forEach(([route, methods]) => {
        Object.entries(methods).forEach(([method, operation]) => {
            // Add request body if needed
            if (INSERT_METHODS.has(method) && operation.input?.length) {
                operation.requestBody = createRequestBody(operation.input[0]);
            }
            operation?.output?.forEach(method => {
                const {pascalCase, suffix, prefix} = transformStr(method);
                // console.log(schemas.schemas[pascalCase]);
            })

            // Add responses
            operation.responses = createResponses(
                method,
                operation.output,
                route.match(PATH_PARAM_REGEX) !== null,
                INSERT_METHODS.has(method)
            );
        });
    });
}

module.exports = {
    enhanceCollectionsWithBodyAndResponses
};