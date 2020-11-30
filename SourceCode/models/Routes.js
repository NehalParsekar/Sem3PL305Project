const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const Routes = db.define('Route', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    adminId: {
        type: Sequelize.STRING
    },
    routeName: {
        type: Sequelize.STRING
    },
    routeFare: {
        type: Sequelize.FLOAT
    },
    sStationId: {
        type: Sequelize.STRING
    },
    dStationId: {
        type: Sequelize.STRING
    }
});

module.exports = Routes;