const SITE_TITLE = 'Online LGU Katipunan Appointment System'
const User = require('../models/user');
const requestedForm = require('../models/request');
const Vehicle = require('../models/vehicle');

module.exports.index = async (req,res) => {
    if(req.session.login){
        const UserIdlogin = req.session.login;
        const allOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];
        const users = await User.find();
        const user = await User.findById(UserIdlogin);
        const reqForms = await requestedForm.find({userId: user._id});
        const reqForm = await requestedForm.find();
        const vehicle = await Vehicle.find({userId:UserIdlogin});
        res.render('index', {
            site_tile: SITE_TITLE,
            title: 'dashboard',
            users: users,
            user: user,
            reqForm: reqForm,
            reqForms: reqForms,
            allOptions, selectedOptions: user.selectedOptions,
            messages: req.flash(),
            vehicle: vehicle,
        })
    }else{
        res.redirect('/login')
    }
}