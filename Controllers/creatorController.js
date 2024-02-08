const SITE_TITLE = 'Online LGU Katipunan Appointment System'
const User = require('../models/user');
const requestedForm = require('../models/request');
const Vehicle = require('../models/vehicle');

module.exports.index = async (req, res) => {
    if (req.session.login) {
        const UserIdlogin = req.session.login;
        const users = await User.find();
        const user = await User.findById(UserIdlogin);
        const reqForm = await requestedForm.find({ userId: user._id });
        const reqForms = await requestedForm.find();
        const vehicle = await Vehicle.find();
        const vehicles = await Vehicle.find();

        res.render('creator', {
            site_tile: SITE_TITLE,
            title: 'dashboard',
            users: users,
            user: user,
            reqForm: reqForm,
            reqForms: reqForms,
            messages: req.flash(),
            vehicles: vehicles,


        })
    } else {
        res.redirect('/login')
    }
}
module.exports.approve = async (req, res) => {
    const actions = req.body.actions;
    if (actions === 'approve') {
        const formId = req.body.formId;
        // const vechile = await Vehicle.findByIdAndUpdate({ status: 'deployed' });
        try {
            // Find the requested form by its ID
            const requestForm = await requestedForm.findByIdAndUpdate(formId, { status: 'Approved' });

            // Check if all selected vehicles have a quantity greater than 0
            const allQuantitiesNonZero = await Promise.all(requestForm.selectedVehicle.map(async (vehicleId) => {
                const vehicle = await Vehicle.findById(vehicleId);
                return vehicle.qty !== 0;
            }));
            
            if (allQuantitiesNonZero.every(quantity => quantity)) {
                const selectedVehicles = await Vehicle.find({ _id: { $in: requestForm.selectedVehicle } });
                await Promise.all(selectedVehicles.map(async (vehicle) => {
                    vehicle.status = 'deployed';
                    vehicle.qty = 0;
                    await vehicle.save();
                }));
                req.flash('success', 'Approved');
            } else {
                req.flash('message', 'Cannot Approved Some selected vehicles deployed.');
                res.redirect('/vehicles');
            }
        } catch (error) {
            console.error('Error approving request:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (actions === 'decline') {

        console.log('decline');
    } else {
        console.log('Default logic goes here');
    }
}