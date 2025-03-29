const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('instrument', {
        /**
         * @swag
         * methods: list, item
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        /**
         * @swag
         * methods: list, item, put, post
         * description: type of the instrument
         */
        type: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        /**
         * @swag
         * methods: list, item
         */
        purchaseDate: {
            allowNull: false,
            type: DataTypes.DATE
        }
    });
};