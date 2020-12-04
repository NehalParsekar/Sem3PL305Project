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
    },
    status: {
        type: Sequelize.BOOLEAN.key,
        defaultValue: true
    }
});

module.exports = Routes;

module.exports.getRoutesBetweenStations = (sStationId, dStationId) => {
    return new Promise((resolve, reject) => {
        Routes.findAll({
            where: {
                sStationId,
                dStationId
            }
        }).then(data => {
            if(data == null){
                return reject({message: 'No Routes'});
            } else {
                var route, routesArray = [];
                data.forEach(el => {
                    route = el.dataValues;
                    if(route.status){
                        routesArray.push(route);
                    }
                });
                routesArray.sort((a, b) => {
                    var nameA = a.routeFare;
                    var nameB = b.routeFare;
    
                    if(nameA < nameB){
                        return -1;
                    } else if(nameA > nameB){
                        return 1;
                    } else {
                        return 0;
                    }
                });
                return resolve(routesArray);
            }
        }).catch(e => {
            return reject(e);
        });
    });
}