const {modelParser} = require('./src/parsers/newParser');

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

const model = modelParser(userModel);
console.log(JSON.stringify(model, null, 4));