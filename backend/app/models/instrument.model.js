const { DataTypes } = require('sequelize');
const User = require('./user.model');

const Instrument = sequelize.define('Instrument', {
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

User.hasMany(Instrument);
Instrument.belongsTo(User);

module.exports = Instrument;