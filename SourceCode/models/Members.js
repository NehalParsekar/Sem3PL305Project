const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const Members = db.define('Member', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    adminId: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.STRING
    }
});

module.exports = Members;