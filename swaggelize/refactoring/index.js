const { modelParser } = require('./src/parsers/modelParser');
const { getFileInDirectory, readFileContent } = require("./src/utils/utils");
const fs = require("node:fs");
const { serviceParser } = require('./src/parsers/serviceParser');
const listEndpoints = require("express-list-endpoints");

const userModel = `
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const User = require('./user.model');

const Post = sequelize.define('Post', {
    /**
     * @swag
     * description: Post title
     * methods: list, item, put, post
     */
    title: DataTypes.STRING,
    /**
     * @swag
     * description: Post content
     * methods: list, item, put, post
     */
    content: DataTypes.TEXT,
});

const Tag = sequelize.define('Tag', {
    /**
     * @swag
     * description: Tag name
     * methods: list, item, put, post
     */
    name: DataTypes.STRING,
});

module.exports = Post;
`;

const pathToModels = '../../backend/app/models'
const pathToServices = '../../backend/app/docs/services'
const modelsFiles = getFileInDirectory(pathToModels)
const servicesFiles = getFileInDirectory(pathToServices)

function getModels() {
    const models = []
    modelsFiles.forEach(file => {
        const code = readFileContent(`${pathToModels}/${file}`)
        models.push(...modelParser(code).filter(m => !Array.isArray(m)));
    })
    fs.writeFileSync('test.json', JSON.stringify(models, null, 4));
}

function getServiceParser() {

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
        const content = readFileContent(`${pathToServices}/${file}`);
        const { collectionOperations, itemOperations } = serviceParser(content);

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

    console.log(JSON.stringify(allOperations, null, 4));
    return allOperations;
}

function getEndPointsApi(app) {
    return listEndpoints(app)
}

function parser(routeVariable, routePrefix) {
    console.log(getEndPointsApi(routeVariable));
}

module.exports = parser;