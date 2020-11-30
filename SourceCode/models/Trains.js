const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const Trains = db.define('Train', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    adminId: {
        type: Sequelize.STRING
    },
    acSeats: {
        type: Sequelize.INTEGER
    },
    generalSeats: {
        type: Sequelize.INTEGER
    },
    trainName: {
        type: Sequelize.STRING
    }
});

module.exports = Trains;