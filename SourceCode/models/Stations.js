const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const Stations = db.define('Station', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    adminId: {
        type: Sequelize.STRING
    },
    stateId: {
        type: Sequelize.STRING
    },
    stationName: {
        type: Sequelize.STRING
    }
});

module.exports = Stations;