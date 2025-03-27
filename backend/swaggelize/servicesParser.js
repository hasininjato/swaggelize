const utils = require("./utils");
const yaml = require('js-yaml');
const routerParser = require("./routerParser");

const servicesParser = (servicePath, routesVariable, routePrefix) => {
    let collectionJson = {};
    const servicesFile = utils.getFileInDirectory(servicePath);
    servicesFile.forEach((file) => {
        const contentYaml = utils.readFileContent(`${servicePath}/${file}`);
        const parsedYaml = yaml.load(contentYaml);
        const routes = routerParser.getEndPointsApi(routesVariable);
        const model = Object.keys(parsedYaml)[0];
        // process collection operations (post or that returns array of objects)
        const collectionOperations = parsedYaml[model].collectionOperations;
        routes.forEach((route) => {
            const match = new RegExp(`^${routePrefix}/${model.toLowerCase()}s?$`);
            if (match.test(route.path)) {
                const routeWithoutPrefix = route.path.replace(routePrefix, "");

                // Initialize the route object if it doesn't exist
                if (!collectionJson[routeWithoutPrefix]) {
                    collectionJson[routeWithoutPrefix] = {};
                }

                route.methods.forEach((method) => {
                    const methodLower = method.toLowerCase();
                    const collectionOperationsMethod = collectionOperations[methodLower];

                    collectionJson[routeWithoutPrefix][methodLower] = {
                        summary: collectionOperationsMethod.openapi_context.summary,
                        description: collectionOperationsMethod.openapi_context.description,
                    };

                    if (["post", "put", "patch"].includes(methodLower)) {
                        collectionJson[routeWithoutPrefix][methodLower]["input"] =
                            collectionOperationsMethod.input ?? [];
                    }

                    collectionJson[routeWithoutPrefix][methodLower]["output"] =
                        collectionOperationsMethod.output ?? [];
                });
            }
        });
        console.log(collectionJson)
    })
    return collectionJson;
}

module.exports = { servicesParser };