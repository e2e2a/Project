const SITE_TITLE = 'Online LGU Katipunan Appointment System'
const User = require('../models/user');
const requestedForm = require('../models/request');
const Vehicle = require('../models/vehicle');

module.exports.index = async (req, res) => {
    const login = req.session.login;
    const userLogin = await User.findById(login);
    try {
        if (userLogin) {
            if (userLogin.role === 'creator') {
                const UserIdlogin = req.session.login;
                const users = await User.find();
                const user = await User.findById(UserIdlogin);
                const reqForm = await requestedForm.find({ userId: user._id });
                const reqForms = await requestedForm.find();
                const vehicle = await Vehicle.find();
                const vehicles = await Vehicle.find();
                res.render('creator', {
                    site_title: SITE_TITLE,
                    title: 'Home',
                    currentUrl: req.originalUrl,
                    users: users,
                    user: user,
                    reqForm: reqForm,
                    reqForms: reqForms,
                    messages: req.flash(),
                    vehicles: vehicles,
                })
            } else {
                return res.render('404')
            }
        } else {
            return res.redirect('/login')
        }
    } catch (err) {
        console.log('err:', err)
    }
}
module.exports.approve = async (req, res) => {
    const actions = req.body.actions;
    if (actions === 'approve') {
        const formId = req.body.formId;
        try {
            const requestForm = await requestedForm.findById(formId);

            // Check not equal to 0
            const allQuantitiesNonZero = await Promise.all(requestForm.selectedVehicle.map(async (selectedVehicle) => {
                const vehicleCount = await Vehicle.countDocuments({ type: selectedVehicle.vehicleId, qty: { $gt: 0 }, status: 'available' });
                return vehicleCount >= selectedVehicle.qty;
            }));

            // Check if all selected not equal to 0
            if (allQuantitiesNonZero.every(quantity => quantity)) {
                await Promise.all(requestForm.selectedVehicle.map(async (selectedVehicle) => {
                    // Find and update the required number of vehicles of this type
                    const vehiclesToUpdate = await Vehicle.find({ type: selectedVehicle.vehicleId, qty: { $gt: 0 }, status: 'available' }).limit(selectedVehicle.qty);
                    await Promise.all(vehiclesToUpdate.map(async (vehicle) => {
                        vehicle.qty = 0;
                        vehicle.status = 'process';
                        await vehicle.save();
                    }));
                }));


                await requestedForm.findByIdAndUpdate(formId, { status: 'process' });
                req.flash('message', 'Approved');
                return res.status(200).redirect('/vehicles');
            } else {
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
module.exports.remove = async (req, res) => {
    const formId = req.body.formId;
    try {
        const requestForm = await requestedForm.findById(formId);
        // Check if all selected vehicles have non-zero quantities
        const allQuantitiesNonZero = await Promise.all(requestForm.selectedVehicle.map(async (selectedVehicle) => {
            const vehicleCount = await Vehicle.countDocuments({ type: selectedVehicle.vehicleId, qty: 0, status: 'process' });
            return vehicleCount >= selectedVehicle.qty;
        }));
        // Check if all selected vehicles have non-zero quantities
        if (allQuantitiesNonZero.every(quantity => quantity)) {
            await Promise.all(requestForm.selectedVehicle.map(async (selectedVehicle) => {
                const vehiclesToUpdate = await Vehicle.find({ type: selectedVehicle.vehicleId, qty: 0, status: 'process' }).limit(selectedVehicle.qty);
                await Promise.all(vehiclesToUpdate.map(async (vehicle) => {
                    vehicle.qty = 1;
                    vehicle.status = 'available';
                    await vehicle.save();
                }));
            }));
            await requestedForm.findByIdAndUpdate(formId, { status: 'pending' });
            req.flash('message', 'Request Cancelled Successfully!');
            return res.status(200).redirect('/vehicles');
        } else {
            req.flash('message', 's');
            return res.status(400).redirect('/vehicles');
        }
    } catch (error) {
        console.error('Error approving request:', error);
    }
}

module.exports.inventory = async (req, res) => {
    const UserIdlogin = req.session.login;
    const user = await User.findById(UserIdlogin);
    if (user) {
        if (user.role === 'creator') {
            const reqForms = await requestedForm.find();
            const vehicles = await Vehicle.find();
            res.render('creator_vehicles', {
                site_title: SITE_TITLE,
                title: 'Dashboard',
                currentUrl: req.originalUrl,
                user: user,
                reqForms: reqForms,
                messages: req.flash(),
                vehicles: vehicles,
            });
        } else {
            return res.status(404).render('/404')
        }
    } else {
        return res.redirect('/404')
    }
}