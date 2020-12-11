const Sequelize = require("sequelize");
const db = require("../config/dbConfig");

const Schedules = db.define("Schedule", {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    scheduleName: {
        type: Sequelize.STRING,
    },
    adminId: {
        type: Sequelize.STRING,
    },
    arrival: {
        type: Sequelize.TIME,
    },
    departure: {
        type: Sequelize.TIME,
    },
    status: {
        type: Sequelize.BOOLEAN.key,
        defaultValue: true,
    },
});

module.exports = Schedules;
