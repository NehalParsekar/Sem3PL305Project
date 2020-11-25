const Sequelize =  require('sequelize');
const sequelize = new Sequelize('railway', 'root', 'nehalnehal', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
    pol: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = sequelize;