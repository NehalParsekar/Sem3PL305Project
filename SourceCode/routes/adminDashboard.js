const { Router } = require('express');
const express = require('express');
const router = express.Router();
const commonFunctions = require('../functions/common');
const Schedules = require('../models/Schedules');
const States = require('../models/States');
const Stations = require('../models/Stations');
const Trains = require('../models/Trains');
const Routes = require('../models/Routes');

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
    commonFunctions.findAllInArray(States, 'stateName', null).then((states) => {
        options.data = {
            messages : {
                success_msg: req.flash('success_msg'),
                error_msg: req.flash('error_msg'),
                error: req.flash('error')
            },
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
    }).catch((e) => {
        messageArray.push({
            type: 'danger',
            text: e.message
        });
        options.data.messageArray = messageArray;
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

router.get('/stations', (req, res) =>{
    options.data = {
        messages : {
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
            error: req.flash('error')
        },
        userData : req.user
    }

    var messageArray = [];

    var extras = [{
        model: States,
        nameColumn: 'stateName',
        idColumn: 'stateId'
    }];

    commonFunctions.findAllInArray(States, 'stateName', null).then((states) => {
        if(states.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No states added. Please add States to add Stations.'
            });
        }
        options.data.messageArray = messageArray;
        options.data.states = states;
        
        commonFunctions.findAllInArray(Stations, 'stationName', extras).then((stations) => {
            options.data.stations = stations;

            res.render('stations', options);
        });
    }).catch((e) => {
        messageArray.push({
            type: 'danger',
            text: e.message
        });
        options.data.messageArray = messageArray
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

router.get('/trains', (req, res) =>{
    options.data = {
        messages : {
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
            error: req.flash('error')
        },
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Trains, 'trainName', null).then(trains => {
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
        messageArray.push({
            type: 'danger',
            text: e.message
        });
        options.data.messageArray = messageArray;
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
    })
});

router.get('/schedules', (req, res) =>{
    options.data = {
        messages : {
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
            error: req.flash('error')
        },
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Schedules, 'scheduleName', null).then(schedules => {
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
        messageArray.push({
            type: 'danger',
            text: e.message
        });
        options.data.messageArray = messageArray;
        res.render('schedule', options);
    })
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

router.get('/routes', (req, res) =>{
    options.data = {
        messages : {
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
            error: req.flash('error')
        },
        userData : req.user
    }

    var messageArray = [];

    commonFunctions.findAllInArray(Stations, 'stationName', null).then(stations => {
        if(stations.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No stations added. Please add stations to add a Route.'
            });
        }
        options.data.stations = stations;
        commonFunctions.findAllInArray(Schedules, 'scheduleName', null).then(schedules =>{
            if(schedules.length == 0){
                messageArray.push({
                    type: 'danger',
                    text: 'No schedules added. Please add schedules to add a Route.'
                });
            }
            options.data.schedules = schedules;
            commonFunctions.findAllInArray(Trains, 'trainName', null).then(trains =>{
                if(trains.length == 0){
                    messageArray.push({
                        type: 'danger',
                        text: 'No trains added. Please add trains to add a Route.'
                    });
                }
                options.data.trains = trains;
                options.data.messageArray = messageArray;
                res.render('routes', options);
            });
        });
    }).catch(e => {
        messageArray.push({
            type: 'danger',
            text: e.message
        });
        options.data.messageArray = messageArray;
        res.render('routes', options);
    });
});

router.post('/routes', (req, res) => {
    var {routeName, sStaionId, dStationId, scheduleId, trainId, routeFare} = req.body;
    console.log(Array.isArray(trainId));
    console.log(Array.isArray(scheduleId));
    
    // Routes.findOne({
    //     where: {
    //         routeName
    //     }
    // }).then().catch(e => {
    //     req.flash('error_msg', e.message);
    // });
    
    res.redirect('/admin/dashboard/routes');
});

router.get('/users', (req, res) =>{
    res.render('users', options);
});

router.get('/reports', (req, res) =>{
    res.render('reports', options);
});

module.exports = router;