const { mainParser, extractModelDefinitions } = require("../src/parsers/modelParser");

const code = `
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

module.exports = {Transaction, Post};

`;

const parsedModel = mainParser(code);
describe('model parser module', () => {
    it('extract model definitions', () => {
        parsedModel.forEach((element) => {
            expect(extractModelDefinitions(element)).toBe('Post');
        });
    });
});
