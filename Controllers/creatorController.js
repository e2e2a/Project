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
        try {
            const requestForm = await requestedForm.findById(formId);

            // Check if all selected vehicles have non-zero quantities
            const allQuantitiesNonZero = await Promise.all(requestForm.selectedVehicle.map(async (selectedVehicle) => {
                const vehicleCount = await Vehicle.countDocuments({ type: selectedVehicle.vehicleId, qty: { $gt: 0 }, status: 'available' });
                return vehicleCount >= selectedVehicle.qty; // Check if enough vehicles of this type are available
            }));

            // Check if all selected vehicles have non-zero quantities
            if (allQuantitiesNonZero.every(quantity => quantity)) {
                // Deduct quantities for all selected vehicles
                await Promise.all(requestForm.selectedVehicle.map(async (selectedVehicle) => {
                    // Find and update the required number of vehicles of this type
                    const vehiclesToUpdate = await Vehicle.find({ type: selectedVehicle.vehicleId, qty: { $gt: 0 }, status: 'available' }).limit(selectedVehicle.qty);
                    await Promise.all(vehiclesToUpdate.map(async (vehicle) => {
                        vehicle.qty = 0; // Deduct the quantity of each vehicle
                        vehicle.status = 'process'; // Update status to pending
                        await vehicle.save();
                    }));
                }));

                // Update the status of the form to 'Process'
                await requestedForm.findByIdAndUpdate(formId, { status: 'process' });

                // Handle successful update
                req.flash('success', 'Approved');
                return res.status(200).redirect('/vehicles');
            } else {
                // Handle the case where some selected vehicles have insufficient quantity
                req.flash('message', 'Cannot approve form. Some selected vehicles have insufficient quantity.');
                return res.status(400).redirect('/vehicles');
            }

        } catch (error) {
            console.error('Error approving request:', error);
        }
    } else if (actions === 'decline') {

        console.log('decline');
    } else {
        console.log('Default logic goes here');
    }
}