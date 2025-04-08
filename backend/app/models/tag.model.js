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

/**
 * @swag
 * relations: Tags
 */
Post.belongsToMany(Tag, { through: "PostTag" });
/**
 * @swag
 * relations: Posts
 */
Tag.belongsToMany(Post, { through: "PostTag" });

module.exports = Tag;