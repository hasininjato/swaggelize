const utils = require("./utils");
const modelParser = require("./modelParser");
const fs = require("fs");
const componentsCreator = require("./componentCreator");
const servicesParser = require("./services/servicesParser");

const parser = (swaggelizeOptions) => {
    const swaggerDefinition = swaggelizeOptions.swaggerDefinition;
    const servicesPath = swaggelizeOptions.servicesPath;
    const modelsPath = swaggelizeOptions.modelsPath;
    const routesVariable = swaggelizeOptions.routesVariable;
    const middlewareAuth = swaggelizeOptions.middlewareAuth;
    const routePrefix = swaggelizeOptions.routePrefix;
    const files = utils.getFileInDirectory(modelsPath);
    let schemas = {};
    const securitySchemes = {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            },
            "basicAuth": {
                "type": "http",
                "scheme": "basic"
            }
        }
    };
    let models = [];
    files.forEach((file) => {
        const code = utils.readFileContent(`${modelsPath}/${file}`);
        const model = modelParser.modelParser(code); // generate the model
        const schema = componentsCreator.createSchemas(model);
        models.push(model);
        schemas.schemas = {
            ...schemas.schemas,
            ...schema
        }
    })
    const openapi = {
        ...openapiInformation(swaggerDefinition),
        components: {
            ...securitySchemes,
            ...schemas
        }
    };

    const services = servicesParser.servicesParser(servicesPath, routesVariable, routePrefix, schemas);
    openapi["paths"] = {...services};

    fs.writeFileSync("../swaggelize/json/models.json", JSON.stringify(models, null, 4));
    fs.writeFileSync("../swaggelize/json/schemas.json", JSON.stringify(schemas, null, 4));
    fs.writeFileSync("../swaggelize/json/services.json", JSON.stringify(services, null, 4));
    return openapi;
}

const openapiInformation = (swaggerDefinition) => {
    return {
        openapi: swaggerDefinition.openapi,
        info: swaggerDefinition.info,
        servers: swaggerDefinition.servers,
        version: swaggerDefinition.version
    }
}

module.exports = { parser };