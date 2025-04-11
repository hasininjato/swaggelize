const {mainParser, extractModelDefinitions} = require("./src/parsers/modelParser.js");
const fs = require("fs");
const {modelParser, extractFields, extractTimestampFields, extractRelations} = require("./src/parsers/modelParser");

const userModel = `
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const User = require('./user.model');

const Profile = sequelize.define('Profile', {
    /**
     * @swag
     * description: Profile ID
     * methods: list, item, put, post
     */
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    /**
     * @swag
     * description: Profile bio
     * methods: list, item, put, post
     */
    bio: DataTypes.TEXT
});

User.hasOne(Profile, { foreignKey: {name: 'profileId'} });
Profile.belongsTo(User);

module.exports = Profile;
`;

const parsedModel = mainParser(userModel);
parsedModel.forEach((element, index) => {
    const modelDefinitions = extractModelDefinitions(element);
    const modelRelations = extractRelations(element);
    console.log(JSON.stringify(modelRelations, null, 4));
});
