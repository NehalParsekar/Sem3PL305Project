const express = require('express');
const Users = require('../models/Users');
const router = express.Router();
const commonFunctions = require('../functions/common');
const States = require('../models/States');
const Stations = require('../models/Stations');
const Routes = require('../models/Routes');
const RouteTrains = require('../models/RouteTrain');
const RouteSchedules = require('../models/RouteSchedule');
const Tickets = require('../models/Tickets');

const options = {
    layout : 'user',
    data : null
}

router.get('/', (req, res) => {
    var data = {
        userData : req.user,
        data: null
    }
    options.data = data;

    if(data.userData.userType === 'admin'){
        res.redirect('/admin/dashboard');
    }
    res.render('userDashboard', options);
});

router.get('/profile', (req, res) => {
    options.data = {
        userData : req.user,
        messages: commonFunctions.flashMessages(req)
    }
    res.render('userProfile', options);
});

router.get('/tickets', (req, res) =>{
    var messageArray = [];
    options.data.userData = req.user;
    options.data.messages = commonFunctions.flashMessages(req);
    Users.getMembers(req.user.id).then(members => {
        members.unshift(req.user);
        members[0].userName = 'Myself';
        options.data.members = members;
        
        States.getAllStates().then(statesArray => {
            options.data.states = statesArray;
            Tickets.getTickets(req.user.id, false).then(ticketArray => {
                options.data.tickets = ticketArray;
                res.render('tickets', options);
            }).catch(e => {
                if(e.custom){
                    messageArray.push({
                        type: 'danger',
                        text: e.message
                    });
                    options.data.messageArray = messageArray;
                } else {
                    console.log(e.message);
                }
                res.render('tickets', options);
            });
        }).catch(e => {
            if(e.custom){
                messageArray.push({
                    type: 'danger',
                    text: e.message
                })
            } else {
                console.log(e.message);
            }
            res.render('tickets', options);
        });
    }).catch(e => {
        console.log(e.message);
        res.render('tickets', options);
    });
});

router.get('/sourceStation/:id', (req, res) => {
    var data;
    Stations.getStateStations(req.params.id).then(stationsArray => {
        data = {
            error: false,
            stationsArray
        }
        res.send(data);
    }).catch(e => {
        data = {
            error: true,
            message: null
        }
        if(e.custom){
            data.message = e.message;
        } else {
            console.log(e.message);
            data.message = 'Error getting Stations';
        }
        res.send(data);
    });
});

router.get('/getRoutes/:sStationId/:dStationId', (req, res) => {
    const {sStationId, dStationId} = req.params;
    var p, promiseArray = [];
    var sendData = {
        error: false
    }
    var scheduleArray = [], routeArray = [];
    
    Routes.getRoutesBetweenStations(sStationId, dStationId).then(data => {
        routeArray = data;
        data.forEach(route => {
            p = RouteSchedules.getSchedules(route.id).then(data => {
                scheduleArray = data;
            });
            promiseArray.push(p);
        });
        
        Promise.all(promiseArray).then(() => {
            sendData.error = false;
            sendData.routesArray = routeArray;
            sendData.schedulesArray = scheduleArray;
            res.send(sendData);
        }).catch(e => {
            sendData.error = true
            if(e.custom){
                sendData.message = e.message;
            } else {
                console.log(e.message);
                sendData.message = 'Error at getting Routes';
            }
            res.send(sendData);
        });
    }).catch(e => {
        sendData.error = true
        if(e.custom){
            sendData.message = e.message;
        } else {
            console.log(e.message);
            sendData.message = 'Error at getting Routes';
        }
        res.send(sendData);
    });
});

router.get('/getTrains/:count/:isAcInt/:routeId/:scheduleId/:date', (req, res) => {
    const { count, routeId, isAcInt, scheduleId, date} = req.params;
    var isAc = true ? parseInt(isAcInt) : false;

    var sendData = {
        error: true,
        message: "Error at getting trains"
    }

    RouteTrains.getTrains(routeId, scheduleId, date, count, isAc).then(trainArray => {
        sendData.error = false;
        sendData.data = trainArray;
        res.send(sendData);
    }).catch(e => {
        if(e.custom){
            sendData.message = e.message;
        } else {
            console.log(e);
        }
        res.send(sendData);
    });
});

router.post('/tickets/book', (req, res) => {
    const {sStateId, sStationId, dStateId, dStationId, routeId, scheduleId, members, ticketCoach, ticketDate, trainId, ticketFare} = req.body;
    var p, promiseArray = [];

    if(Array.isArray(members)){
        members.forEach(el => {
            p = Tickets.create({
                userId : el,
                adminId: req.user.id,
                trainId,
                routeId,
                scheduleId,
                sStateId,
                dStateId,
                sStationId,
                dStationId,
                ticketDate,
                ticketCoach,
                ticketFare
            });
            promiseArray.push(p);
        })
        Promise.all(promiseArray).then(() => {
            req.flash('success_msg', 'Tickets Booked');
            res.redirect('/dashboard/tickets');
        }).catch(e => {
            console.log(e);
            res.redirect('/dashboard/tickets');
        });
    } else {
        Tickets.create({
            userId : members,
            adminId: req.user.id,
            trainId,
            routeId,
            scheduleId,
            sStateId,
            dStateId,
            sStationId,
            dStationId,
            ticketDate,
            ticketCoach,
            ticketFare
        }).then(() => {
            req.flash('success_msg', 'Tickets Booked');
            res.redirect('/dashboard/tickets');
        }).catch(e => {
            console.log(e.message);
            res.redirect('/dashboard/tickets');
        });
    }
})

router.get('/tickets/cancel/:id', (req, res) => {
    Tickets.cancelTicket(req.params.id).then(() => {
        req.flash('success_msg', 'Ticket cancelled');
        res.redirect('/dashboard/tickets');
    }).catch(e => {
        req.flash('error_msg', 'Error at cancelling ticket.');
        res.redirect('/dashboard/tickets');
    });
});

router.get('/transactions', (req, res) =>{
    var messageArray = [];
    options.data.userData = req.user;
    Tickets.getTickets(req.user.id, true).then(ticketsArray => {
        options.data.transactions = ticketsArray;
        res.render('transactions', options);
    }).catch(e => {
        if(e.custom){
            messageArray.push({
                type: 'danger',
                text: 'No transactions yet'
            });
            options.data.messageArray = messageArray;
        } else {
            console.log(e.message);
        }
        res.render('transactions', options);
    });
});

router.get('/members', (req, res) =>{
    var messageArray = [];
    options.data.userData = req.user;
    options.data.messages = commonFunctions.flashMessages(req);
    Users.getMembers(req.user.id).then(userArray => {
        if(userArray.length == 0){
            messageArray.push({
                type: 'danger',
                text: 'No members added.'
            });
        }
        options.data.messageArray = messageArray;
        options.data.users = userArray;
        res.render('members', options);
    }).catch(e => {
        console.log(e.message);
        res.render('members', options);
    });
});

router.post('/members', (req, res) => {
    const {name, address, year, gender, contact, email} = req.body;
    options.data.messages = commonFunctions.flashMessages(req);
    options.data.userData = req.user;
    var messageArray = [];

    Users.saveMember({
        userName: name,
        userAddress: address,
        userYear: year,
        userGender: gender,
        userContact: contact,
        userEmail: email,
        userType: 'user'
    }, req.user.id).then(() => {
        req.flash('success_msg', 'Member added');
        res.redirect('/dashboard/members');
    }).catch(e => {
        if(e.custom){
            messageArray.push({
                type: 'danger',
                text: e.message
            });
            options.data.messageArray = messageArray;
            options.data.messages = commonFunctions.flashMessages(req);
            res.render('members', options);
        } else {
            console.log(e.message);
            res.redirect('/dashboard/members');
        }
    });
});

router.get('/members/update/:id', (req, res) => {
    options.data.userData = req.user;
    var messageArray = [];

    Users.findByPk(req.params.id).then(data => {
        var member = data.get();
        member.status = true;

        messageArray.push({
            type: 'danger',
            text: 'Please Update here'
        });

        options.data.messageArray = messageArray;
        options.data.updateMember = member;
        options.data.messages = commonFunctions.flashMessages(req);
        res.render('members', options);
    }).catch(e => {
        console.log(e.message);
        res.render('members', options);
    });
});

router.post('/members/update', (req, res) => {
    const {userId, name, address, year, contact} = req.body;

    Users.findByPk(userId).then(user => {
        user.userName = name;
        user.userAddress = address;
        user.userYear = year;
        user.userContact = contact;
        user.save().then(() => {
            req.flash('success_msg', 'Member updated.');
            res.redirect('/dashboard/members');
        }).catch(e => {
            console.log(e.message);
            res.redirect('/dashboard/members');
        });
    }).catch(e => {
        console.log(e.message);
        res.redirect('/dashboard/members');
    });
});

router.post('/updateProfile', (req, res) => {
    const {name, address, year, contact} = req.body;

    Users.updateUser(req.user.id, name, address, year, contact).then(() => {
        req.flash('success_msg', 'Profile updated')
        res.redirect('/dashboard/profile');
    }).catch(e => {
        console.log(e.message);
        res.redirect('/dashboard/profile');
    });
});

router.post('/updatePassword', (req, res) => {
    const {currentP, password, cPassword} = req.body;

    if(password != cPassword){
        req.flash('error_msg', 'New Passwords do not match.')
        res.redirect('/dashboard/profile');
    } else {
        Users.updatePassword(req.user.id, currentP, password).then(() => {
            req.flash('success_msg', 'Passwords Changed');
            res.redirect('/dashboard/profile');
        }).catch(e => {
            if(e.custom){
                req.flash('error_msg', e.message);
            } else {
                console.log(e.message);
            }
            res.redirect('/dashboard/profile');
        });
    }
});

module.exports = router;