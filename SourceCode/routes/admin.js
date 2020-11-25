const express = require('express');
const router = express.Router();
const passport = require('passport');

const options = {
    layout : 'admin',
    data : null
}

router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
});

router.get('/login', (req, res) =>{
    res.render('adminLogin');
});

router.post('/login', (req, res, next) => {
    require('../config/passport')(passport, 'admin');
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) =>{
    req.logOut();
    req.flash('success_msg', 'You are logged out.')
    res.render('adminLogin');
});

module.exports = router;