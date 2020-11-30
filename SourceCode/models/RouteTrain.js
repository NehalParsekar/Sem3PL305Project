const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const RouteTrain = db.define('RouteTrain', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    routeId: {
        type: Sequelize.STRING
    },
    trainId: {
        type: Sequelize.STRING
    }
});

module.exports = RouteTrain;