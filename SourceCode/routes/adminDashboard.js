const express = require('express');
const router = express.Router();

const options = {
    layout : 'admin',
    data : null
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

router.get('/routes', (req, res) =>{
    res.render('routes', options);
});

router.get('/schedules', (req, res) =>{
    res.render('schedules', options);
});

router.get('/states', (req, res) =>{
    res.render('states', options);
});

router.get('/stations', (req, res) =>{
    res.render('stations', options);
});

router.get('/trains', (req, res) =>{
    res.render('trains', options);
});

router.get('/users', (req, res) =>{
    res.render('users', options);
});

module.exports = router;