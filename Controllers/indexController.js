const SITE_TITLE = 'Online LGU Katipunan Appointment System'
const User = require('../models/user');
const requestedForm = require('../models/request');
const Vehicle = require('../models/vehicle');

module.exports.index = async (req,res) => {
    const login = req.session.login;
    const userLogin = await findById(login);
    if(userLogin.role === 'member'){
        const UserIdlogin = req.session.login;
        const users = await User.find();
        const user = await User.findById(UserIdlogin);
        const reqForms = await requestedForm.find({userId: user._id});
        const reqForm = await requestedForm.find();
        const vehicle = await Vehicle.find();
        const vehicles = await Vehicle.find();
//         const selectedVehicleIds = [...new Set(reqForms.flatMap(form => form.selectedVehicle))];
// console.log(selectedVehicleIds)
// // Using $in operator to find vehicles with the extracted IDs
// const selectedVehicles = await Vehicle.find({ _id: { $in: selectedVehicleIds } });
// console.log(selectedVehicles)
        res.render('index', {
            site_tile: SITE_TITLE,
            title: 'dashboard',
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
}