const { modelParser } = require('./src/parsers/modelParser');
const { getFileInDirectory, readFileContent } = require("./src/utils/utils");
const { serviceParser } = require('./src/parsers/serviceParser');
const fs = require("fs");

function getModels(modelsPath, modelsFiles) {
    const models = []
    modelsFiles.forEach(file => {
        const code = readFileContent(`${modelsPath}/${file}`)
        models.push(...modelParser(code).filter(m => !Array.isArray(m)));
    })

    fs.writeFileSync("../swaggelize/models.json", JSON.stringify(models, null, 4));
    return models;
}

function getServiceParser(servicesPath, servicesFiles, routesVariable) {

    // Combining results from all service files
    let allOperations = {
        "collectionOperations": {
            default: {},
            custom: {}
        },
        "itemOperations": {
            default: {},
            custom: {}
        }
    };

    servicesFiles.forEach(file => {
        const content = readFileContent(`${servicesPath}/${file}`);
        const { collectionOperations, itemOperations } = serviceParser(content, routesVariable);

        // Merge collectionOperations
        allOperations.collectionOperations.default = {
            ...allOperations.collectionOperations.default,
            ...(collectionOperations?.default || {})
        };
        allOperations.collectionOperations.custom = {
            ...allOperations.collectionOperations.custom,
            ...(collectionOperations?.custom || {})
        };

        // Merge itemOperations
        allOperations.itemOperations.default = {
            ...allOperations.itemOperations.default,
            ...(itemOperations?.default || {})
        };
        allOperations.itemOperations.custom = {
            ...allOperations.itemOperations.custom,
            ...(itemOperations?.custom || {})
        };
    });

    fs.writeFileSync("../swaggelize/services.json", JSON.stringify(allOperations, null, 4));

    return allOperations;
}

function parser(swaggelizeOptions) {
    const swaggerDefinition = swaggelizeOptions.swaggerDefinition;
    const servicesPath = swaggelizeOptions.servicesPath;
    const modelsPath = swaggelizeOptions.modelsPath;
    const routesVariable = swaggelizeOptions.routesVariable;
    const middlewareAuth = swaggelizeOptions.middlewareAuth;
    const routePrefix = swaggelizeOptions.routePrefix;
    const files = getFileInDirectory(modelsPath);

    const modelsFiles = getFileInDirectory(modelsPath);
    const models = getModels(modelsPath, modelsFiles);

    const servicesFiles = getFileInDirectory(servicesPath);
    const services = getServiceParser(servicesPath, servicesFiles, routesVariable);
}

module.exports = parser;