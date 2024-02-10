const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const SITE_TITLE = 'Online LGU Katipunan Appointment System'
const User = require('../models/user');
const requestedForm = require('../models/request');
const Vehicle = require('../models/vehicle');

module.exports.index = async (req, res) => {
    const login = req.session.login;
    const userLogin = await User.findById(login);
    try {
        if (userLogin) {
            if (userLogin.role === 'admin') {
                const UserIdlogin = req.session.login;
                const users = await User.find();
                const user = await User.findById(UserIdlogin);
                const reqForms = await requestedForm.find();
                const vehicle = await Vehicle.find();
                const vehicles = await Vehicle.find();
                res.render('admin', {
                    site_title: SITE_TITLE,
                    title: 'Admin',
                    currentUrl: req.originalUrl,
                    users: users,
                    user: user,
                    reqForms: reqForms,
                    messages: req.flash(),
                    vehicle: vehicle,
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

            const allQuantitiesNonZero = await Promise.all(requestForm.selectedVehicle.map(async (selectedVehicle) => {
                const vehicleCount = await Vehicle.countDocuments({ type: selectedVehicle.vehicleId, qty: 0, status: 'process' });
                return vehicleCount >= selectedVehicle.qty;
            }));

            if (allQuantitiesNonZero.every(quantity => quantity)) {
                await Promise.all(requestForm.selectedVehicle.map(async (selectedVehicle) => {
                    // Find and update the required number of vehicles of this type
                    const vehiclesToUpdate = await Vehicle.find({ type: selectedVehicle.vehicleId, qty: 0, status: 'process' }).limit(selectedVehicle.qty);
                    await Promise.all(vehiclesToUpdate.map(async (vehicle) => {
                        vehicle.status = 'deployed';
                        await vehicle.save();
                    }));
                }));

                await requestedForm.findByIdAndUpdate(formId, { status: 'approved' });
                req.flash('message', 'Approved');
                const user = await User.findById(req.session.login);
                const requestUser = await User.findById(requestForm.userId)
                const createdBy = requestForm.userId.toString();
                const savedRequestIdString = requestForm._id.toString();
                const savedRequestNameString = requestForm.requestorName.toString();
                const formURL = `public/upload/pdf/${createdBy}/${savedRequestIdString}`;
                const outputFolderPath = path.resolve(__dirname, '../public/upload/pdf/', createdBy, savedRequestIdString);
                const outputPath = path.join(outputFolderPath, `${savedRequestNameString}.pdf`);
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'emonawong22@gmail.com',
                        pass: 'nouv heik zbln qkhf',
                    },
                });

                // Function to send email
                const sendEmail = async (from, to, subject, htmlContent, outputPath) => {
                    try {
                        const pdfBuffer = fs.readFile(outputPath);

                        // Convert the PDF buffer to base64
                        const pdfBase64 = pdfBuffer.toString('base64');

                        // Construct the data URI for the inline PDF attachment
                        const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;
                        const mailOptions = {
                            from,
                            to,
                            subject,
                            html: htmlContent,
                            attachments: [
                                {
                                    filename: `${requestForm.requestorName}.pdf`,
                                    content: pdfDataUri,
                                    encoding: 'base64',
                                    contentType: 'application/pdf',
                                    path: outputPath
                                },
                            ],
                        };
                        const info = await transporter.sendMail(mailOptions);
                        console.log('Email sent:', info.response);
                    } catch (error) {
                        console.error('Error sending email:', error);
                        throw new Error('Failed to send email');
                    }
                };
                const Link = `https://lguk-online.onrender.com/requests`;
                const emailContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <p style="color: #000; font-size:18px;">This is: <strong>${user.fullname}</strong> (${user.role})</p>
                <p style="color: #000;">The request of <strong>${requestForm.requestorName}</strong> has been approved</p>
                <p>Go to <a href="${Link}" >Dashboard</a> </p>
            </div>
        `;
                sendEmail(
                    `lguk-online.onrender.com <${user.email}>`,
                    `${requestUser.email}`,
                    'Request Form',
                    emailContent,
                    outputPath
                );
                //end
                //end
                return res.status(200).redirect('/admin');
            } else {
                req.flash('message', 'Cannot approve form. Some selected vehicles have been deleted.');
                return res.status(400).redirect('/admin');
            }
        } catch (error) {
            console.error('Error approving request:', error);
        }
    } else if (actions === 'decline') {

        console.log('decline');
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
            await requestedForm.findByIdAndUpdate(formId, { status: 'declined' });
            req.flash('message', 'Request Cancelled Successfully!');
            return res.status(200).redirect('/admin');
        } else {
            req.flash('message', 's');
            return res.status(400).redirect('/vehicles');
        }
    } catch (error) {
        console.error('Error approving request:', error);
    }
    } else {
        console.log('Default logic goes here');
    }
}
module.exports.dashboard = async (req, res) => {
    const login = req.session.login;
    const userLogin = await User.findById(login);
    try {
        if (userLogin) {
            if (userLogin.role === 'admin') {
                const UserIdlogin = req.session.login;
                const users = await User.find();
                const user = await User.findById(UserIdlogin);
                const reqForms = await requestedForm.find();
                const vehicle = await Vehicle.find();
                const vehicles = await Vehicle.find();
                res.render('dashboard', {
                    site_title: SITE_TITLE,
                    title: 'Dashboard',
                    currentUrl: req.originalUrl,
                    users: users,
                    user: user,
                    reqForms: reqForms,
                    messages: req.flash(),
                    vehicle: vehicle,
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