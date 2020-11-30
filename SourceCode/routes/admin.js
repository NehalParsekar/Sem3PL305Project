const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportInit = require('../config/passport');

const options = {
    layout : 'admin',
    data : null
}

router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
});

router.get('/login', (req, res) =>{
    options.layout = 'in';
    options.data = {
        messages : {
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
            error: req.flash('error')
        }
    }
    res.render('adminLogin', options);
});

router.post('/login', (req, res, next) => {
    passportInit(passport, 'admin');
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/admin/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) =>{
    req.logOut();
    req.flash('success_msg', 'You are logged out.')
    res.render('adminLogin');
});

module.exports = router;