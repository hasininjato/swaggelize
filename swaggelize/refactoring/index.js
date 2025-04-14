const {modelParser} = require('./src/parsers/modelParser');
const {getFileInDirectory, readFileContent} = require("./src/utils/utils");
const fs = require("node:fs");
const {serviceParser} = require('./src/parsers/serviceParser');

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
const models = []
modelsFiles.forEach(file => {
    const code = readFileContent(`${pathToModels}/${file}`)
    models.push(...modelParser(code).filter(m => !Array.isArray(m)));
})
fs.writeFileSync('test.json', JSON.stringify(models, null, 4));

const servicesFiles = getFileInDirectory(pathToServices)

// Combining results from all service files
let allOperations = {};
servicesFiles.forEach(file => {
    const content = readFileContent(`${pathToServices}/${file}`)
    const fileOperations = serviceParser(content);

    // Combine the operations from the current service file into the overall operations
    allOperations = {
        default: {...allOperations.default, ...fileOperations.default},
        custom: {...allOperations.custom, ...fileOperations.custom},
    };
});

// console.log(JSON.stringify(allOperations, null, 4));