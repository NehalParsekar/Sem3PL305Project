const Sequelize = require('sequelize');
const db = require('../config/dbConfig');
const Trains = require('./Trains');
const Schedules = require('./Schedules');
const States = require('./States');
const Stations = require('./Stations');
const Users = require('./Users');

const Tickets = db.define('Ticket', {
    id: {
        type : Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: Sequelize.STRING
    },
    adminId: {
        type: Sequelize.STRING
    },
    routeId: {
        type: Sequelize.STRING
    },
    trainId: {
        type: Sequelize.STRING
    },
    scheduleId: {
        type: Sequelize.STRING
    },
    dStateId: {
        type: Sequelize.STRING
    },
    sStateId: {
        type: Sequelize.STRING
    },
    sStationId: {
        type: Sequelize.STRING
    },
    dStationId: {
        type: Sequelize.STRING
    },
    ticketDate: {
        type: Sequelize.DATEONLY
    },
    ticketCoach: {
        type: Sequelize.BOOLEAN
    },
    status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    ticketFare: {
        type: Sequelize.FLOAT
    }
});

module.exports = Tickets;

module.exports.getTickets = (adminId, all) => {
    return new Promise((resolve, reject) =>{
        Tickets.findAll({
            where: {
                adminId
            }
        }).then(data => {
            if(data.length == 0){
                return reject({
                    custom: true,
                    message: 'No Tickets Booked yet'
                });
            } else {
                var ticket, ticketArray = [], index = 1;
                var promiseArray = [], promises = [];
                data.forEach(el => {
                    ticket = el.dataValues;
                    if(ticket.status || all){
                        var ticketData = {
                            id: null,
                            index: null,
                            userName: null,
                            trainName: null,
                            arrival: null,
                            departure: null,
                            ticketDate: null,
                            ticketCoach: null,
                            sStateName: null,
                            sStationName: null,
                            dStateName: null,
                            dStationName: null,
                            ticketFare: null,
                            ststus: null
                        }
                        ticketData.index = index;
                        index++;
                        ticketData.id = ticket.id;
                        ticketData.status = ticket.status;
                        ticketData.ticketFare = ticket.ticketFare;
                        ticketData.ticketDate = ticket.ticketDate;
                        ticketData.ticketCoach = 'AC' ? ticket.ticketCoach : 'General';
                        promiseArray.push(
                            Users.findByPk(ticket.userId).then(data => {
                                ticketData.userName = data.get().userName;
                            })
                        );
                        promiseArray.push(
                            Trains.findByPk(ticket.trainId).then(data => {
                                ticketData.trainName = data.get().trainName;
                            })
                        );
                        promiseArray.push(
                            Schedules.findByPk(ticket.scheduleId).then(data => {
                                ticketData.arrival = data.get().arrival;
                                ticketData.departure = data.get().departure;
                            })
                        );
                        promiseArray.push(
                            States.findByPk(ticket.sStateId).then(data => {
                                ticketData.sStateName = data.get().stateName;
                            })
                        );
                        promiseArray.push(
                            States.findByPk(ticket.dStateId).then(data => {
                                ticketData.dStateName = data.get().stateName;
                            })
                        );
                        promiseArray.push(
                            Stations.findByPk(ticket.sStationId).then(data => {
                                ticketData.sStationName = data.get().stationName;
                            })
                        );
                        promiseArray.push(
                            Stations.findByPk(ticket.dStationId).then(data => {
                                ticketData.dStationName = data.get().stationName;
                            })
                        );
                        promises.push(Promise.all(promiseArray).then(() => {
                            ticketArray.push(ticketData);
                        }))
                    }
                });
                Promise.all(promises).then(() => {
                    return resolve(ticketArray);
                }).catch(e => {
                    e.custom = false;
                    return reject(e);
                });
            }
        }).catch(e => {
            e.custom = false;
            return reject(e);
        });
    });
}

module.exports.cancelTicket = (ticketId) => {
    return new Promise((resolve, reject) => {
        Tickets.findByPk(ticketId).then(ticket => {
            ticket.status = false;
            ticket.save().then(() => {
                return resolve();
            }).catch(e => {
                return reject(e);
            });
        }).catch(e => {
            return reject(e);
        });
    });
}