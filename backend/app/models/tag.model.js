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

const PostTags = sequelize.define('PostTags', {
    postId: {
        type: DataTypes.INTEGER,
        references: {
            model: Post,
            key: 'id',
        },
    },
    tagId: {
        type: DataTypes.INTEGER,
        references: {
            model: Tag,
            key: 'id',
        },
    },
});

/**
 * @swag
 * relations: Tags
 */
Post.belongsToMany(Tag, { through: PostTags });
/**
 * @swag
 * relations: Posts
 */
Tag.belongsToMany(Post, { through: PostTags });

module.exports = Tag;