const utils = require("./utils");
const yaml = require('js-yaml');
const listEndpoints = require('express-list-endpoints');

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

        const collectionRoutePattern = new RegExp(`^${routePrefix}/${modelLower}s?$`);
        const itemRoutePattern = new RegExp(`^${routePrefix}/${modelLower}s?/:([^/]+)$`);

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

            route.methods.forEach((method) => {
                const methodLower = method.toLowerCase();
                const operationMethod = operations[methodLower];
                if (!operationMethod) return;

                const operationData = {
                    summary: operationMethod.openapi_context.summary,
                    description: operationMethod.openapi_context.description,
                    output: operationMethod.output ?? []
                };

                // Add parameters for item operations
                if (!isCollectionRoute) {
                    operationData.parameters = [generateParameter(paramName, model)];
                }

                if ((isCollectionRoute && methodLower === "post") ||
                    ["put", "patch"].includes(methodLower)) {
                    operationData.input = operationMethod.input ?? [];
                }

                collectionJson[routeWithoutPrefix][methodLower] = operationData;
            });
        });
    });
    generateBody(collectionJson);
    generateResponse(collectionJson);

    return collectionJson;
};

const generateParameter = (parameterName, model) => {
    return {
        in: "path",
        name: parameterName,
        schema: {
            type: "string"
        },
        required: true,
        description: `${model} ${parameterName}`
    }
}

/**
 * generate request body for post, put, patch methods
 * @param {json} serviceCollections 
 * @returns {json} serviceCollections
 */
const generateBody = (serviceCollections) => {
    const INSERT_METHODS = new Set(["post", "put", "patch"]);
    const requestBody = {
        requestBody: {}
    };
    Object.keys(serviceCollections).forEach((route) => {
        Object.keys(serviceCollections[route]).forEach((method) => {
            if (INSERT_METHODS.has(method)) {
                const input = serviceCollections[route][method].input;
                input.forEach((i) => {
                    const { pascalCase, suffix, prefix } = transformStr(i);
                    requestBody["requestBody"] = {
                        content: {
                            "application/json": {
                                schema: {
                                    "$ref": `#/components/schemas/${pascalCase}`
                                }
                            }
                        }
                    }
                    serviceCollections[route][method] = Object.assign(serviceCollections[route][method], requestBody);
                })
            }
        })
    });
    return serviceCollections;
}

/**
 * generate resopnses body
 * @param {json} serviceCollections 
 * @returns {json} serviceCollections
 */
const generateResponse = (serviceCollections) => {
    const responses = {
        responses: {}
    };
    const internalServerError = {
        "500": {
            "description": "Internal server error"
        }
    };
    const notFound = {
        "404": {
            "description": "Not found"
        }
    };
    const badRequest = {
        "400": {
            "description": "Bad request"
        }
    };
    Object.keys(serviceCollections).forEach((route) => {
        Object.keys(serviceCollections[route]).forEach((method) => {
            const output = serviceCollections[route][method].output || [];
            if (output.length === 0) {
                responses["responses"] = {
                    "204": {
                        description: "Deleted"
                    }
                }
            } else {
                output.forEach((o) => {
                    const { pascalCase, suffix, prefix } = transformStr(o);
                    // if method is post, return 201, otherwise return 200 if method is not delete
                    if (method === "post") {
                        responses["responses"] = {
                            "201": {
                                description: `Created ${prefix}`,
                                content: {
                                    "application/json": {
                                        schema: {
                                            "$ref": `#/components/schemas/${pascalCase}`
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        responses["responses"] = {
                            "200": {
                                description: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${suffix}`,
                                content: {
                                    "application/json": {
                                        schema: {
                                            "$ref": `#/components/schemas/${pascalCase}`
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (["post", "put", "patch"].includes(method)) {
                        responses["responses"] = {
                            ...responses["responses"],
                            ...badRequest
                        }
                    }
                    // regex to check if route has {str} in it
                    const regex = new RegExp("{([^}]+)}", "g");
                    const match = route.match(regex);
                    if (match) {
                        responses["responses"] = {
                            ...responses["responses"],
                            ...notFound
                        }
                    }
                })
            }
            responses["responses"] = {
                ...responses["responses"],
                ...internalServerError
            };
            serviceCollections[route][method] = {
                ...serviceCollections[route][method],
                ...responses
            };
        })
    });
    return serviceCollections;
}

const transformStr = (input) => {
    const [prefix, suffix] = input.split(':');

    const pascalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const pascalCase = suffix
        ? pascalPrefix + suffix.charAt(0).toUpperCase() + suffix.slice(1)
        : pascalPrefix;

    return { pascalCase, suffix, prefix };
}

const getEndPointsApi = (app) => {
    return listEndpoints(app);
}

module.exports = { servicesParser };