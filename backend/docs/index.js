const parserModel = require("./parserModel");
const listEndpoints = require('express-list-endpoints');
const componentsCreator = require("./componentsCreator");
const services = require("./servicesParser");
const utils = require("./utils");
const yaml = require('js-yaml');

const swaggelize = (modelPath, prefix, app) => {
    const files = parserModel.parserModel(modelPath);
    // console.log(files)
    const schemas = componentsCreator.createSchemas(files);
    console.log(schemas)
    // // console.log(JSON.stringify(files, null, 2))
    // // const routes = listRoutes(app);
    // // console.log('List of Routes:');
    // // routes.forEach((route) => console.log(route));
    // const servicesFiles = utils.getFileInDirectory("app/docs/services")
    // servicesFiles.forEach((service) => {
    //     const serviceContent = utils.readFileContent(`app/docs/services/${service}`);
    //     // console.log(serviceContent.split('\n')[0])
    // })
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