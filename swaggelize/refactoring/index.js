const {mainParser, extractModelDefinitions} = require("./src/parsers/modelParser.js");
const fs = require("fs");
const {extractFields} = require("./src/parsers/modelParser");
const {moduleExpression} = require("@babel/types");

const userModel = `
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');

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

module.exports = {Post};
`;

const parsedModel = mainParser(userModel);
parsedModel.forEach((element, index) => {
    // const modelDefinitions = extractModelDefinitions(element);
    // console.log(modelDefinitions);
    const modelFields = extractFields(element);
    console.log(modelFields)
});