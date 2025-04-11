const {mainParser, extractModelDefinitions} = require("./src/parsers/modelParser.js");
const fs = require("fs");
const {modelParser, extractFields, extractTimestampFields, extractRelations} = require("./src/parsers/modelParser");

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

/**
 * @swag
 * relations: Posts
 */
User.hasMany(Post, { onDelete: 'CASCADE' });
Post.belongsTo(User);

module.exports = Post;
`;

const parsedModel = mainParser(userModel);
parsedModel.forEach((element, index) => {
    const modelDefinitions = extractModelDefinitions(element);
    const modelRelations = extractRelations(element);
    console.log(JSON.stringify(modelRelations, null, 4));
});
