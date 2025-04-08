const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const Post = require('./post.model');

const Tag = sequelize.define('Tag', {
    /**
     * @swag
     * description: Tag name
     * methods: list, item, put, post
     */
    name: DataTypes.STRING,
});

module.exports = Tag;