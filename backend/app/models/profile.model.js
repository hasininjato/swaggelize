const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const User = require('./user.model');

const Profile = sequelize.define('Profile', {
    /**
     * @swag
     * description: Profile ID
     * methods: list, item, put, post
     */
    bio: DataTypes.TEXT
});

User.hasOne(Profile);
Profile.belongsTo(User);

module.exports = Profile;