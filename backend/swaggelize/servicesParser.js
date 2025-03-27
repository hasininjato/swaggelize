const utils = require("./utils");
const yaml = require('js-yaml');
const routerParser = require("./routerParser");
const { response } = require("express");

const servicesParser = (servicePath, routesVariable, routePrefix, schemas) => {
    const collectionJson = {};
    const servicesFiles = utils.getFileInDirectory(servicePath);

    servicesFiles.forEach((file) => {
        const contentYaml = utils.readFileContent(`${servicePath}/${file}`);
        const parsedYaml = yaml.load(contentYaml);
        const routes = routerParser.getEndPointsApi(routesVariable);
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
    generateBody(collectionJson, schemas);
    // console.log(JSON.stringify(collectionJson, null, 4));

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

const generateBody = (serviceCollections, schemas) => {
    const INSERT_METHODS = new Set(["post", "put", "patch"]);
    const requestBody = {
        requestBody: {}
    };
    const responses = {
        responses: {
            200: {}
        }
    }
    Object.keys(serviceCollections).forEach((route) => {
        Object.keys(serviceCollections[route]).forEach((method) => {
            if (INSERT_METHODS.has(method)) {
                const input = serviceCollections[route][method].input;
                input.forEach((i) => {
                    const { pascalCase, suffix } = transformStr(i);
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
            } else {
                const output = serviceCollections[route][method].output;
                output.forEach((o) => {
                    const { pascalCase, suffix } = transformStr(o);
                    responses["responses"][200] = {
                        description: suffix,
                        content: {
                            "application/json": {
                                schema: {
                                    "$ref": `#/components/schemas/${pascalCase}`
                                }
                            }
                        }
                    }
                    serviceCollections[route][method] = Object.assign(serviceCollections[route][method], responses);
                })
            }
        })
    });
    // console.log(JSON.stringify(requestBody, null, 4));
    console.log(JSON.stringify(serviceCollections, null, 4));
    return serviceCollections;
}

// const pascalCase = (str) => {
//     const parts = str.split(':');
//     const pascalCase = parts
//         .map(part => part.charAt(0).toUpperCase() + part.slice(1))
//         .join(''); // Join without separator
//     return { pascalCase, parts[0].charAt(0).toUpperCase() };
// }

const transformStr = (input) => {
    const [prefix, suffix] = input.split(':');

    const pascalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const pascalCase = suffix
        ? pascalPrefix + suffix.charAt(0).toUpperCase() + suffix.slice(1)
        : pascalPrefix;

    return { pascalCase, suffix };
}

module.exports = { servicesParser };