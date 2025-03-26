const utils = require("./utils");
const modelParser = require("./modelParser");
const fs = require("fs");
const componentsCreator = require("./componentCreator");
const servicesParser = require("./servicesParser");

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
    files.forEach((file) => {
        const code = utils.readFileContent(`${modelsPath}/${file}`);
        const model = modelParser.modelParser(code);
        const schema = componentsCreator.createSchemas(model);
        schemas = {
            schemas: schema
        }
    })
    const openapi = {
        ...openapiInformation(swaggerDefinition),
        components: {
            ...securitySchemes,
            schemas: schemas
        }
    };
    const services = servicesParser.servicesParser(servicesPath, routesVariable, routePrefix);
    console.log(services)
    return openapi;
}

const openapiInformation = (swaggerDefinition) => {
    return {
        openapi: swaggerDefinition.openapi,
        info: swaggerDefinition.info,
        servers: swaggerDefinition.servers
    }
}

module.exports = { parser };