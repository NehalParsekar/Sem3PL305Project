const Sequelize = require('sequelize');
const db = require('../config/dbConfig');

const Users = db.define('User', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    userName: {
        type: Sequelize.STRING
    },
    userAddress :{
        type: Sequelize.STRING
    },
    userYear:{
        type: Sequelize.INTEGER
    },
    userGender :{
        type: Sequelize.STRING
    },
    userContact :{
        type: Sequelize.STRING
    },
    userEmail :{
        type: Sequelize.STRING
    },
    userPassword: {
        type: Sequelize.STRING
    },
    userType: {
        type: Sequelize.STRING
    }
});

module.exports = Users;