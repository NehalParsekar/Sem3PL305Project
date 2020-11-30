const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const States = db.define('State', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    adminId: {
        type: Sequelize.STRING
    },
    stateName: {
        type: Sequelize.STRING
    }
});

module.exports = States;