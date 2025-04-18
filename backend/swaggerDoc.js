const swaggerJsDoc = require('swagger-jsdoc');
const parser = require('../swaggelize/refactoring');
const swaggerUi = require("swagger-ui-express");

// swaggelize configuration
function swagglizeConfig(app) {
    const swaggelizeOptions = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'Swaggelize API',
                description: 'API automatic generator using Swagger API and Swaggelize',
                contact: {
                    name: 'Hasininjato Rojovao'
                },
                version: '1.0.0'
            },
            servers: [
                {
                    url: "http://localhost:8000/api"
                },
                {
                    url: "http://localhost:3000/api"
                }
            ],
        },
        servicesPath: './app/docs/services',
        modelsPath: './app/models',
        defaultSecurity: 'jwt',
        routesVariable: app,
        middlewareAuth: 'verifyToken',
        routePrefix: "/api"
    }
    return parser(swaggelizeOptions);
}

module.exports = swagglizeConfig;