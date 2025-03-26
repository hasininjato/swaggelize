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
            console.log(route.path)
            if (match.test(route.path)) {
                // console.log(route.methods)
                route.methods.forEach((method) => {
                    const methodLower = method.toLowerCase();
                    const collectionOperationsMethod = collectionOperations[methodLower]
                    collectionJson[methodLower] = {
                        summary: collectionOperationsMethod.openapi_context.summary,
                        description: collectionOperationsMethod.openapi_context.description,
                    };
                    if (["post", "put", "patch"].includes(methodLower)) {
                        collectionJson[methodLower]["input"] = collectionOperationsMethod.input ?? []
                    }
                    collectionJson[methodLower]["output"] = collectionOperationsMethod.output ?? []
                })
            }
            
        })
    })
    return collectionJson;
}

module.exports = { servicesParser };