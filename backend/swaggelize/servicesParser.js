const utils = require("./utils");
const yaml = require('js-yaml');
const routerParser = require("./routerParser");

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

const generateBody = (servicesCollecionts, schemas) => {
    const INSERT_METHODS = new Set(["post", "put", "patch"]);
    const requestBody = {};
    Object.keys(servicesCollecionts).forEach((route) => {
        Object.keys(servicesCollecionts[route]).forEach((method) => {
            if (INSERT_METHODS.has(method)) {
                const input = servicesCollecionts[route][method].input;
            } else {
                const output = servicesCollecionts[route][method].output;
            }
        })
    });
}

module.exports = { servicesParser };