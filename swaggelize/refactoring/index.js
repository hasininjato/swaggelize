const {modelParser} = require('./src/parsers/modelParser');
const {getFileInDirectory, readFileContent} = require("./src/utils/utils");
const fs = require("node:fs");

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

const path = '../../backend/app/models'
const files = getFileInDirectory(path)
const models = []
files.forEach(file => {
    const code = readFileContent(`${path}/${file}`)
    models.push(...modelParser(code).filter(m => !Array.isArray(m)));
})
fs.writeFileSync('test.json', JSON.stringify(models, null, 4));