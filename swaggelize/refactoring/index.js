const {modelParser} = require('./src/parsers/newParser');

const userModel = `
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');

const User = sequelize.define('User', {
    /**
     * @swag
     * methods: item, list, post, put
     * description: Id of the user
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    /**
     * @swag
     * methods: item, list, put, post
     */
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        validate: {
            notNull: { msg: "Full name is required" },
            notEmpty: { msg: "Full name cannot be empty" }
        }
    },
    /**
     * @swag
     * methods: item, list, put, post
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: "unique_email",
            msg: "This email is already in use"
        },
        validate: {
            notNull: { msg: "Email is required" },
            notEmpty: { msg: "Email cannot be empty" },
            isEmail: {
                msg: "Invalid email"
            }
        }
    },
    /**
     * @swag
     * methods: put, post
     */
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Password is required" },
            notEmpty: { msg: "Password cannot be empty" }
        }
    },
}, {
    timestamps: true
});

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
}, {
    timestamps: true
});

module.exports = User;
`;

const model = modelParser(userModel);
console.log(JSON.stringify(model, null, 4));