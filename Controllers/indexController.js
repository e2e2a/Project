const SITE_TITLE = 'Online LGU Katipunan Appointment System';
const User = require('../models/user');
const requestedForm = require('../models/request');
const Vehicle = require('../models/vehicle');

module.exports.index = async (req,res) => {
    const login = req.session.login;
    const userLogin = await User.findById(login);
    try {
        if(userLogin){
            if(userLogin.role === 'member'){
            const UserIdlogin = req.session.login;
            const users = await User.find();
            const user = await User.findById(UserIdlogin);
            const reqForms = await requestedForm.find({userId: user._id});
            const reqForm = await requestedForm.find();
            const vehicle = await Vehicle.find();
            const vehicles = await Vehicle.find();
            res.render('index', {
                site_title: SITE_TITLE,
                title: 'Home',
                users: users,
                user: user,
                reqForm: reqForm,
                reqForms: reqForms,
                messages: req.flash(),
                vehicle: vehicle,
                vehicles:vehicles,
            })
            }else{
                return res.render('404')
            }
        }else{
            return res.redirect('/login')
        }
    }catch(err){
        console.log('err:', err)
    }
}
module.exports.requests = async(req,res) => {
    const login = req.session.login;
    const userLogin = await User.findById(login);
    try {
        if(userLogin){
            if(userLogin.role === 'member'){
            const UserIdlogin = req.session.login;
            const users = await User.find();
            const user = await User.findById(UserIdlogin);
            const reqForms = await requestedForm.find({userId: user._id});
            const reqForm = await requestedForm.find();
            
            res.render('request_status', {
                site_title: SITE_TITLE,
                title: 'Requests',
                users: users,
                user: user,
                reqForm: reqForm,
                reqForms: reqForms,
                messages: req.flash(),
                
            })
            }else{
                return res.render('404')
            }
        }else{
            return res.redirect('/login')
        }
    }catch(err){
        console.log('err:', err)
    }
}