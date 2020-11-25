const express = require('express');
const router = express.Router();

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

router.get('/tickets', (req, res) =>{
    res.render('tickets', options);
});

router.get('/transactions', (req, res) =>{
    res.render('transactions', options);
});

router.get('/members', (req, res) =>{
    res.render('members', options);
});

module.exports = router;