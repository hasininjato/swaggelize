const utils = require("./utils");
const yaml = require('js-yaml');
const routerParser = require("./routerParser");

const servicesParser = (servicePath, routesVariable) => {
    const servicesFile = utils.getFileInDirectory(servicePath);
    servicesFile.forEach((file) => {
        const contentYaml = utils.readFileContent(`${servicePath}/${file}`);
        const parsedYaml = yaml.load(contentYaml);
        const routes = routerParser.getEndPointsApi(routesVariable);
        const model = Object.keys(parsedYaml)[0];
        const collectionOperations = parsedYaml[model].collectionOperations;
        console.log(routes)
        for (const collection in collectionOperations) {
            for(const route in collectionOperations[collection]) {
                console.log(collectionOperations[collection][route])
            }
        }
    })
    return servicesFile;
}

module.exports = { servicesParser };