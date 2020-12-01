const express = require('express');
const Users = require('../models/Users');
const router = express.Router();
const commonFunctions = require('../functions/common');

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
    res.render('tickets', options);
});

router.get('/transactions', (req, res) =>{
    res.render('transactions', options);
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