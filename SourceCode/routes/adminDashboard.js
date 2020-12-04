const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const commonFunctions = require('../functions/common');
const Schedules = require('../models/Schedules');
const States = require('../models/States');
const Stations = require('../models/Stations');
const Trains = require('../models/Trains');
const Routes = require('../models/Routes');
const RouteTrain = require('../models/RouteTrain');
const RouteSchedule = require('../models/RouteSchedule');
const Users = require('../models/Users');

const options = {
    layout : 'admin',
    data: null
}

router.get('/', (req, res) => {
    var data = {
        userData : req.user,
        data: null
    }
    options.data = data;


    if(data.userData.userType === 'user'){
        res.redirect('/dashboard');
    }
    res.render('adminDashboard', options);
});

router.get('/states', (req, res) =>{
    commonFunctions.findAllInArray(States, 'stateName', null, req.user.id).then((states) => {
        options.data = {
            messages : commonFunctions.flashMessages(req),
            userData : req.user,
            states
        }

        var messageArray = [];

        if(states.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No states added.'
            });
        }
        options.data.messageArray = messageArray;
        res.render('states', options);
    }).catch(e => {
        console.log(e.message);
        res.render('states', options);
    });
});

router.post('/states', (req, res) => {
    var stateName = req.body.stateName;

    commonFunctions.findOneAndCreate(States, 'stateName', stateName, {
        stateName,
        adminId: req.user.id
    }, req, res, '/admin/dashboard/states', {
        success_msg : 'State inserted',
        error_msg: 'State name already exists'
    })
});

router.get('/states/update/:id', (req, res) => {
    commonFunctions.findAllInArray(States, 'stateName', null, req.user.id).then((states) => {
        options.data = {
            messages : commonFunctions.flashMessages(req),
            userData : req.user,
            states
        }

        var messageArray = [];

        if(states.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No states added.'
            });
        }
        options.data.messageArray = messageArray;
        States.findByPk(req.params.id).then(data => {
            var state = data.dataValues;
            var updateData = {
                status: true,
                stateName: state.stateName,
                id: state.id
            }
            options.data.updateState = updateData;
            messageArray.push({
                type: 'danger',
                text: 'Please Update here'
            });
            options.data.messageArray = messageArray;
            res.render('states', options);
        }).catch(e => {
            console.log(e.message);
            res.render('states', options);
        });
    }).catch(e => {
        console.log(e.message);
        res.render('states', options);
    });
});

router.post('/states/update', (req, res) => {
    const {stateId, stateName} = req.body;

    States.findByPk(stateId).then(state => {
        States.findOne({
            where: {
                stateName
            }
        }).then(stateDup => {
            if((stateDup == null) || (stateId == stateDup.id)){
                state.stateName = stateName;
                state.save().then(() => {
                    req.flash('success_msg', 'State Updated');
                    res.redirect('/admin/dashboard/states');
                }).catch(e => {
                    console.log(e.message);
                    res.redirect('/admin/dashboard/states');
                });
            } else {
                req.flash('error_msg', 'State name already exists');
                res.redirect('/admin/dashboard/states');
            }
        }).catch(e => {
            console.log(e.message);
            res.redirect('/admin/dashboard/states');
        });
    }).catch(e => {
        console.log(e.message);
        res.redirect('/admin/dashboard/states');
    });
});

router.get('/states/updateStatus/:id', (req, res) => {
    commonFunctions.changeStatus(States, req.params.id).then(() => {
        res.redirect('/admin/dashboard/states');
    }).catch(e => {
        res.redirect('/admin/dashboard/states');
    });
});

router.get('/stations', (req, res) =>{
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    var extras = [{
        model: States,
        nameColumn: 'stateName',
        idColumn: 'stateId',
        dataColumn: 'stateName'
    }];

    commonFunctions.findAllInArray(States, 'stateName', null, req.user.id).then((states) => {
        if(states.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No states added. Please add States to add Stations.'
            });
        }
        options.data.messageArray = messageArray;
        options.data.states = states;
        
        commonFunctions.findAllInArray(Stations, 'stationName', extras, req.user.id).then((stations) => {
            options.data.stations = stations;

            res.render('stations', options);
        }).catch(e => {
            console.log(e.message);
            res.render('stations', options);
        });
    }).catch(e => {
        console.log(e.message);
        res.render('stations', options);
    });
});

router.post('/stations', (req, res) => {
    var {stationName, stateId} = req.body;
    
    commonFunctions.findOneAndCreate(Stations, 'stationName', stationName, {
        stationName,
        stateId,
        adminId: req.user.id
    }, req, res, '/admin/dashboard/stations', {
        success_msg: 'Station data inserted.',
        error_msg: 'Station name already exists.'
    });
});

router.get('/stations/update/:id/:stateName', (req, res) =>{
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    var extras = [{
        model: States,
        nameColumn: 'stateName',
        idColumn: 'stateId',
        dataColumn: 'stateName'
    }];

    commonFunctions.findAllInArray(States, 'stateName', null, req.user.id).then((states) => {
        if(states.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No states added. Please add States to add Stations.'
            });
        }
        options.data.messageArray = messageArray;
        options.data.states = states;
        
        commonFunctions.findAllInArray(Stations, 'stationName', extras, req.user.id).then((stations) => {
            options.data.stations = stations;

            Stations.findByPk(req.params.id).then(data => {
                var station = data.dataValues;
                var updateData = {
                    status: true,
                    id: station.id,
                    stationName: station.stationName,
                    stateName: req.params.stateName
                }
                messageArray.push({
                    type: 'danger',
                    text: 'Please Update here'
                });
                options.data.messageArray = messageArray;

                options.data.updateStation = updateData;
                res.render('stations', options);
            }).catch(e => {
                console.log(e.message);
                res.render('stations', options);
            });
        }).catch(e => {
            console.log(e.message);
            res.render('stations', options);
        });
    }).catch(e => {
        console.log(e.message);
        res.render('stations', options);
    });
});

router.post('/stations/update', (req, res) => {
    const {stationId, stationName} = req.body;

    Stations.findByPk(stationId).then(station => {
        Stations.findOne({
            where : {
                stationName
            }
        }).then(stationDup => {
            if((stationDup == null) || (stationId == stationDup.id)){
                station.stationName = stationName;
                station.save().then(() => {
                    req.flash('success_msg', 'Station Updated');
                    res.redirect('/admin/dashboard/stations');
                }).catch(e => {
                    console.log(e.message);
                    res.redirect('/admin/dashboard/stations');
                });
            } else {
                req.flash('error_msg', 'Station name exists');
                res.redirect('/admin/dashboard/stations');
            }
        }).catch(e => {
            console.log(e);
            console.log(e.message);
            res.redirect('/admin/dashboard/stations');
        });
    }).catch(e => {
        console.log(e.message);
        res.redirect('/admin/dashboard/stations');
    });
});

router.get('/stations/updateStatus/:id', (req, res) => {
    commonFunctions.changeStatus(Stations, req.params.id).then(() => {
        res.redirect('/admin/dashboard/stations');
    }).catch(e => {
        res.redirect('/admin/dashboard/stations');
    });
});

router.get('/trains', (req, res) =>{
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Trains, 'trainName', null, req.user.id).then(trains => {
        if(trains.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No trains added.'
            });
        }

        options.data.messageArray = messageArray;
        options.data.trains = trains;

        res.render('trains', options);
    }).catch(e => {
        console.log(e.message);
        res.render('trains', options);
    });
});

router.post('/trains', (req, res) => {
    var {trainName, acSeats, generalSeats } = req.body;

    commonFunctions.findOneAndCreate(Trains, 'trainName', trainName, {
        trainName,
        acSeats,
        generalSeats,
        adminId : req.user.id
    }, req, res, '/admin/dashboard/trains', {
        success_msg: 'Train data inserted',
        error_msg: 'Train name already exists'
    });
});

router.get('/trains/update/:id', (req, res) => {
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Trains, 'trainName', null, req.user.id).then(trains => {
        if(trains.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No trains added.'
            });
        }

        options.data.messageArray = messageArray;
        options.data.trains = trains;

        Trains.findByPk(req.params.id).then(data => {
            var train = data.dataValues;
            var updateData = {
                status: true,
                id: train.id,
                trainName: train.trainName,
                gSeats: train.generalSeats,
                acSeats: train.acSeats
            }

            messageArray.push({
                type: 'danger',
                text: 'Please Update here'
            });
            options.data.messageArray = messageArray;

            options.data.updateTrain = updateData;
            res.render('trains', options);
        }).catch(e => {
            console.log(e.message);
            res.render('trains', options);
        });
    }).catch(e => {
        console.log(e.message);
        res.render('trains', options);
    });
});

router.post('/trains/update', (req, res) => {
    const {trainId, trainName, generalSeats, acSeats} = req.body;

    Trains.findByPk(trainId).then(train => {
        Trains.findOne({
            where: {
                trainName
            }
        }).then(trainDup => {
            if((trainDup == null) || (trainId == trainDup.id)){
                train.trainName = trainName;
                train.generalSeats = generalSeats;
                train.acSeats = acSeats;

                train.save().then(() => {
                    req.flash('success_msg', 'Train updated');
                    res.redirect('/admin/dashboard/trains');
                }).catch(e => {
                    console.log(e.message);
                    res.redirect('/admin/dashboard/trains');
                });
            } else {
                req.flash('error_msg', 'Train name exists');
                res.redirect('/admin/dashboard/trains');
            }
        }).catch(e => {
            console.log(e.message);
            res.redirect('/admin/dashboard/trains');
        });
    }).catch(e => {
        console.log(e.message);
        res.redirect('/admin/dashboard/trains');
    });
});

router.get('/trains/updateStatus/:id', (req, res) => {
    commonFunctions.changeStatus(Trains, req.params.id).then(() => {
        res.redirect('/admin/dashboard/trains');
    }).catch(e => {
        res.redirect('/admin/dashboard/trains');
    });
});

router.get('/schedules', (req, res) =>{
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Schedules, 'scheduleName', null, req.user.id).then(schedules => {
        if(schedules.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No Schedules added.'
            })
        }

        options.data.messageArray = messageArray;
        options.data.schedules = schedules;
        res.render('schedules', options);
    }).catch(e => {
        console.log(e.message);
        res.render('schedules', options);
    });
});

router.post('/schedules', (req, res) =>{
    var {scheduleName, dHour, aHour, dMinute, aMinute} = req.body;
    var arrival = aHour + ":" + aMinute;
    var departure = dHour + ":" + dMinute;

    commonFunctions.findOneAndCreate(Schedules, 'scheduleName', scheduleName, {
        scheduleName,
        arrival,
        departure,
        adminId: req.user.id
    }, req, res, '/admin/dashboard/schedules', {
        success_msg: 'Schedule added',
        error_msg: 'Schedule name already exists'
    })
});

router.get('/schedules/update/:id', (req, res) => {
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Schedules, 'scheduleName', null, req.user.id).then(schedules => {
        if(schedules.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No Schedules added.'
            })
        }

        options.data.messageArray = messageArray;
        options.data.schedules = schedules;
        
        Schedules.findByPk(req.params.id).then(data => {
            var schedule = data.dataValues;
            var timeArray = schedule.departure.split(':');
            var dHour = timeArray[0];
            var dMin = timeArray[1];
            timeArray = schedule.arrival.split(':');
            var aHour = timeArray[0];
            var aMin = timeArray[1];

            var updateData = {
                status: true,
                scheduleName: schedule.scheduleName,
                id: schedule.id,
                dHour,
                dMin,
                aHour,
                aMin
            }

            messageArray.push({
                type: 'danger',
                text: 'Please Update here'
            });
            options.data.messageArray = messageArray;

            options.data.updateSchedule = updateData;
            res.render('schedules', options);
        }).catch(e => {
            console.log(e.message);
            res.render('schedules', options);
        });
    }).catch(e => {
        console.log(e.message);
        res.render('schedules', options);
    });
});

router.post('/schedules/update', (req, res) => {
    const {scheduleId, scheduleName, dHour, dMinute, aHour, aMinute} = req.body;
    const arrival = aHour + ":" + aMinute;
    const departure = dHour + ":" + dMinute;

    Schedules.findByPk(scheduleId).then(schedule => {
        Schedules.findOne({
            where: {
                scheduleName
            }
        }).then(scheduleDup => {
            if((scheduleDup == null) || (scheduleId == scheduleDup.id)){
                schedule.scheduleName = scheduleName;
                schedule.arrival = arrival;
                schedule.departure = departure;
                schedule.save().then(() => {
                    req.flash('success_msg', 'Schedule updated');
                    res.redirect('/admin/dashboard/schedules');
                }).catch(e => {
                    console.log(e.message);
                    res.redirect('/admin/dashboard/schedules');
                });
            } else {
                req.flash('error_msg', 'Schedule name exists');
                res.redirect('/admin/dashboard/schedules');
            }
        }).catch(e => {
            console.log(e.message);
            res.redirect('/admin/dashboard/schedules');
        });
    }).catch(e => {
        console.log(e.message);
        res.redirect('/admin/dashboard/schedules');
    });
});

router.get('/schedules/updateStatus/:id', (req, res) => {
    commonFunctions.changeStatus(Schedules, req.params.id).then(() => {
        res.redirect('/admin/dashboard/schedules');
    }).catch(e => {
        res.redirect('/admin/dashboard/schedules');
    });
});

router.get('/routes', (req, res) =>{
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Stations, 'stationName', null, req.user.id).then(stations => {
        if(stations.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No stations added. Please add stations to add a Route.'
            });
        }
        options.data.stations = stations;
        commonFunctions.findAllInArray(Schedules, 'scheduleName', null, req.user.id).then(schedules =>{
            if(schedules.length == 0){
                messageArray.push({
                    type: 'danger',
                    text: 'No schedules added. Please add schedules to add a Route.'
                });
            }
            options.data.schedules = schedules;
            commonFunctions.findAllInArray(Trains, 'trainName', null, req.user.id).then(trains =>{
                if(trains.length == 0){
                    messageArray.push({
                        type: 'danger',
                        text: 'No trains added. Please add trains to add a Route.'
                    });
                }
                options.data.trains = trains;

                var extras = [
                    {
                        model: Stations,
                        idColumn: 'sStationId',
                        nameColumn: 'stationName',
                        dataColumn: 'sStation'
                    }, {
                        model: Stations,
                        idColumn: 'dStationId',
                        nameColumn: 'stationName',
                        dataColumn: 'dStation'
                    }
                ];
                commonFunctions.findAllInArray(Routes, 'routeName', extras, req.user.id).then(routes => {
                    if(routes.length == 0){
                        messageArray.push({
                            type: 'danger',
                            text: 'No routes added'
                        });
                    }
                    options.data.messageArray = messageArray;
                    options.data.routes = routes;

                    res.render('routes', options);
                }).catch(e => {
                    console.log(e.message);
                    res.render('routes', options);
                });
            }).catch(e => {
                console.log(e.message);
                res.render('routes', options);
            });
        }).catch(e => {
            console.log(e.message);
            res.render('routes', options);
        });
    }).catch(e => {
        console.log(e.message);
        res.render('routes', options);
    });
});

router.post('/routes', (req, res) => {
    var {routeName, sStationId, dStationId, scheduleId, trainId, routeFare} = req.body;
    
    if(sStationId == dStationId){
        req.flash('error_msg', 'Source and destination station cannot be same');
        res.redirect('/admin/dashboard/routes');
    } else {
        Routes.findOne({
            where: {
                routeName
            }
        }).then(data => {
            if(data == null){
                Routes.create({
                    routeName,
                    adminId: req.user.id,
                    routeFare,
                    sStationId,
                    dStationId
                }).then(route => {
                    var routeId = route.id;
                    var promiseArray = [];
                    var p;
                    if(Array.isArray(trainId)){
                        trainId.forEach(element => {
                            p = RouteTrain.create({
                                routeId,
                                trainId: element
                            });
                            promiseArray.push(p);
                        });
                    } else {
                        p = RouteTrain.create({
                            routeId,
                            trainId
                        });
                        promiseArray.push(p);
                    }
                    if(Array.isArray(scheduleId)){
                        scheduleId.forEach(element => {
                            p = RouteSchedule.create({
                                routeId,
                                scheduleId: element
                            });
                            promiseArray.push(p);
                        });
                    } else {
                        p = RouteSchedule.create({
                            routeId,
                            scheduleId
                        });
                        promiseArray.push(p);
                    }
                    Promise.all(promiseArray).then(() => {
                        req.flash('success_msg', 'Route data inserted');
                        res.redirect('/admin/dashboard/routes');
                    }).catch(e => {
                        console.log(e.message);
                        res.redirect('/admin/dashboard/routes');
                    });
                }); 
            } else {
                req.flash('error_msg', 'Route name already exists');
                res.redirect('/admin/dashboard/routes');
            }
        }).catch(e => {
            console.log(e.message);
            res.redirect('/admin/dashboard/routes');
        });
    }
});

router.get('/routes/update/:id/:sStation/:dStation', (req, res) =>  {
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Stations, 'stationName', null, req.user.id).then(stations => {
        if(stations.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No stations added. Please add stations to add a Route.'
            });
        }
        options.data.stations = stations;
        commonFunctions.findAllInArray(Schedules, 'scheduleName', null, req.user.id).then(schedules =>{
            if(schedules.length == 0){
                messageArray.push({
                    type: 'danger',
                    text: 'No schedules added. Please add schedules to add a Route.'
                });
            }
            options.data.schedules = schedules;
            commonFunctions.findAllInArray(Trains, 'trainName', null, req.user.id).then(trains =>{
                if(trains.length == 0){
                    messageArray.push({
                        type: 'danger',
                        text: 'No trains added. Please add trains to add a Route.'
                    });
                }
                options.data.trains = trains;

                var extras = [
                    {
                        model: Stations,
                        idColumn: 'sStationId',
                        nameColumn: 'stationName',
                        dataColumn: 'sStation'
                    }, {
                        model: Stations,
                        idColumn: 'dStationId',
                        nameColumn: 'stationName',
                        dataColumn: 'dStation'
                    }
                ];
                commonFunctions.findAllInArray(Routes, 'routeName', extras, req.user.id).then(routes => {
                    if(routes.length == 0){
                        messageArray.push({
                            type: 'danger',
                            text: 'No routes added'
                        });
                    }
                    options.data.messageArray = messageArray;
                    options.data.routes = routes;

                    Routes.findByPk(req.params.id).then(data => {
                        var route = data.dataValues;
                        var updateData = {
                            status: true,
                            id: route.id,
                            routeName: route.routeName,
                            sStation: req.params.sStation,
                            dStation: req.params.dStation,
                            routeFare: route.routeFare
                        }

                        messageArray.push({
                            type: 'danger',
                            text: 'Please Update here'
                        });
                        options.data.messageArray = messageArray;
                        options.data.updateRoute = updateData;

                        res.render('routes', options);
                    }).catch(e => {
                        console.log(e.message);
                        res.render('routes', options);
                    });
                }).catch(e => {
                    console.log(e.message);
                    res.render('routes', options);
                });
            }).catch(e => {
                console.log(e.message);
                res.render('routes', options);
            });
        }).catch(e => {
            console.log(e.message);
            res.render('routes', options);
        });
    }).catch(e => {
        console.log(e.message);
        res.render('routes', options);
    });
});

router.post('/routes/update', (req, res) => {
    const {routeId, routeName, scheduleId, trainId, routeFare} = req.body;
    
    Routes.findOne({
        where: {
            routeName
        }
    }).then(route => {
        if(route == null){
            RouteSchedule.destroy({
                where: {
                    routeId
                }
            }).then(() => {
                RouteTrain.destroy({
                    where: {
                        routeId
                    }
                }).then(() => {
                    var promiseArray = [];
                    var p;
        
                    if(Array.isArray(trainId)){
                        trainId.forEach(element => {
                            p = RouteTrain.create({
                                routeId,
                                trainId: element
                            });
                            promiseArray.push(p);
                        });
                    } else {
                        p = RouteTrain.create({
                            routeId,
                            trainId
                        });
                        promiseArray.push(p);
                    }
                    if(Array.isArray(scheduleId)){
                        scheduleId.forEach(element => {
                            p = RouteSchedule.create({
                                routeId,
                                scheduleId: element
                            });
                            promiseArray.push(p);
                        });
                    } else {
                        p = RouteSchedule.create({
                            routeId,
                            scheduleId
                        });
                        promiseArray.push(p);
                    }
                    Promise.all(promiseArray).then(() => {
                        Routes.findByPk(routeId).then(route => {
                            route.routeName = routeName;
                            route.routeFare = routeFare;
        
                            route.save().then(() => {
                                req.flash('success_msg', 'Route Updated');
                                res.redirect('/admin/dashboard/routes');
                            }).catch(e => {
                                console.log(e.message);
                                res.redirect('/admin/dashboard/routes');
                            });
                        }).catch(e => {
                            console.log(e.message);
                            res.redirect('/admin/dashboard/routes');
                        });
                    }).catch(e => {
                        console.log(e.message);
                        res.redirect('/admin/dashboard/routes');
                    });
                }).catch(e => {
                    console.log(e.message);
                    res.redirect('/admin/dashboard/routes');
                });
            }).catch(e => {
                console.log(e.message);
                res.redirect('/admin/dashboard/routes');
            });
        } else {
            req.flash('error_msg', 'Route name exists');
            res.redirect('/admin/dashboard/routes');
        }
    }).catch(e => {
        console.log(e.message);
        res.redirect('/admin/dashboard/routes');
    });
});

router.get('/routes/updateStatus/:id', (req, res) => {
    commonFunctions.changeStatus(Routes, req.params.id).then(() => {
        res.redirect('/admin/dashboard/routes');
    }).catch(e => {
        res.redirect('/admin/dashboard/routes');
    });
});

router.get('/users', (req, res) =>{
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    Users.getAllUsers('user').then(users => {
        if(users.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No users yet.'
            });
        }
        options.data.users = users;
        res.render('users', options);
    }).catch(e => {
        console.log(e.message);
        res.render('users', options);
    });
});

router.get('/admins', (req, res) =>{
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    var messageArray = [];

    Users.getAllUsers('admin').then(users => {
        if(users.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No admins yet.'
            });
        }
        options.data.users = users;
        res.render('admins', options);
    }).catch(e => {
        console.log(e.message);
        res.render('admins', options);
    });
});

router.post('/admins', (req, res) => {
    const { name, address, year, gender, contact, email, password, cPassword } = req.body;
    let messages = []

    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }

    Users.count({where : { userEmail : email, userType: 'admin'}}).then((count) => {
        if(count > 0){
            messages.push({
                type: 'danger',
                text: 'Email already registered'
            });
        }

        if(password != cPassword){
            messages.push({
                type: 'danger',
                text: 'Passwords do not match'
            });
        }

        options.data.messageArray = messages;

        if(messages.length > 0){
            res.render('admins', options);
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if(!err){
                        Users.create(
                            {
                                userName : name,
                                userAddress: address,
                                userYear : year,
                                userGender: gender,
                                userContact: contact,
                                userEmail: email,
                                userPassword: hash,
                                userType: 'admin'
                            }
                        ).then(() => {
                            req.flash('success_msg', 'Admin registered.');
                            res.redirect('/admin/dashboard/admins');
                        }).catch((err) => {
                            req.flash('error_msg', err.message);
                            res.redirect('/admin/dashboard/admins');
                        });
                    } else {
                        req.flash('error_msg', err.message);
                        res.redirect('/admin/dashboard/admins');
                    }
                });
            });
        }
    }).catch(e => {
        console.log(e.message);
        res.redirect('/admin/dashboard/admins');
    });
});

router.get('/profile', (req, res) => {
    options.data = {
        messages : commonFunctions.flashMessages(req),
        userData : req.user
    }
    
    res.render('adminProfile', options);
});

router.post('/updateProfile', (req, res) => {
    const {name, address, year, contact} = req.body;

    Users.updateUser(req.user.id, name, address, year, contact).then(() => {
        req.flash('success_msg', 'Profile updated')
        res.redirect('/admin/dashboard/profile');
    }).catch(e => {
        console.log(e.message);
        res.redirect('/admin/dashboard/profile');
    });
});

router.post('/updatePassword', (req, res) => {
    const {currentP, password, cPassword} = req.body;

    if(password != cPassword){
        req.flash('error_msg', 'New Passwords do not match.')
        res.redirect('/admin/dashboard/profile');
    } else {
        Users.updatePassword(req.user.id, currentP, password).then(() => {
            req.flash('success_msg', 'Passwords Changed');
            res.redirect('/admin/dashboard/profile');
        }).catch(e => {
            if(e.custom){
                req.flash('error_msg', e.message);
            } else {
                console.log(e.message);
            }
            res.redirect('/admin/dashboard/profile');
        });
    }
});

router.get('/reports', (req, res) =>{
    res.render('reports', options);
});

module.exports = router;