const parserModel = require("./parserModel");
const listEndpoints = require('express-list-endpoints');
const componentsCreator = require("./componentsCreator");
const services = require("./servicesParser");

const swaggelize = (modelPath, prefix, app) => {
    const files = parserModel.parserModel(modelPath);
    // componentsCreator.create(files);
    // console.log(JSON.stringify(files, null, 2))
    // const routes = listRoutes(app);
    // console.log('List of Routes:');
    // routes.forEach((route) => console.log(route));
    const servicesFiles = services.getServicesFile("app/docs/services")
    servicesFiles.forEach((service) => {
        console.log(service)
    })
}

const listRoutes = (app) => {
    const endpoints = listEndpoints(app);
    console.log('List of Routes:');
    endpoints.forEach((endpoint) => {
        console.log(`${endpoint.methods.join(', ')} ${endpoint.path}`);
    });
    return endpoints;
}


module.exports = { swaggelize };