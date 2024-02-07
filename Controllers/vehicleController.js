const SITE_TITLE = '';
const Vehicle = require('../models/vehicle');

module.exports.doCreate = (req, res) => {
    try {
        const userId = req.session.login;
        const category = req.body.category;
        if (category === 'Motorcycle Vehicles') {
            const type = req.body.typeMotor;
                const data = new Vehicle({
                    userId:userId,
                    brand: req.body.brand,
                    model: req.body.model,
                    plateNumber: req.body.plateNumber,
                    type: type,
                    category: category,
                    qty: req.body.qty,
                });
                data.save().then(() => {
                    console.log('success', data)
                    req.flash('success', 'Creation Success!')
                    return res.redirect('/');
                }, () => {
                    console.log('failed', data)
                    req.flash('failed', 'Creation failed!')
                    return res.redirect('/');
                });
        } else if (category === 'Heavy Equipment Vehicles') {
            const type = req.body.typeHeavy;
                const data = new Vehicle({
                    userId:userId,
                    brand: req.body.brand,
                    model: req.body.model,
                    plateNumber: req.body.plateNumber,
                    type: type,
                    category: category,
                    qty: req.body.qty,
                });
                data.save().then(() => {
                    console.log('success', data)
                    req.flash('success', 'Creation Success!')
                    return res.redirect('/');
                }, () => {
                    console.log('failed', data)
                    req.flash('failed', 'Creation failed!')
                    return res.redirect('/');
                });
        } else if(category === 'Military Vehicles') {
            const type = req.body.typeMilitary;
            const data = new Vehicle({
                userId:userId,
                brand: req.body.brand,
                model: req.body.model,
                plateNumber: req.body.plateNumber,
                type: type,
                category: category,
                qty: req.body.qty,
            });
            data.save().then(() => {
                console.log('success', data)
                req.flash('success', 'Creation Success!')
                return res.redirect('/');
            }, () => {
                console.log('failed', data)
                req.flash('failed', 'Creation failed!')
                return res.redirect('/');
            });
        } else if(category === '4-Wheel Vehicles') {
            const type = req.body.typeWheel;
            const data = new Vehicle({
                userId:userId,
                brand: req.body.brand,
                model: req.body.model,
                plateNumber: req.body.plateNumber,
                type: type,
                category: category,
                qty: req.body.qty,
            });
            data.save().then(() => {
                console.log('success', data)
                req.flash('success', 'Creation Success!')
                return res.redirect('/');
            }, () => {
                console.log('failed', data)
                req.flash('failed', 'Creation failed!')
                return res.redirect('/');
            });
        }
    } catch (error) {
        console.log(error);
    }
}
