const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const RouteSchedule = db.define('RouteSchedule', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    routeId: {
        type: Sequelize.STRING
    },
    scheduleId: {
        type: Sequelize.STRING
    }
});

module.exports = RouteSchedule;