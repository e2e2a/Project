const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../puppeteer.config.cjs');
const ejs = require('ejs');
const reqForm = require('../models/request');
const User = require('../models/user');
const Vehicle = require('../models/vehicle')
const nodemailer = require('nodemailer');
module.exports.index = async (req, res) => {
    try {
        if (!req.session.login) {
            return res.redirect('/login');
        }
        const selectedVehicleIds = Array.isArray(req.body.selectedVehicle) ? req.body.selectedVehicle : [req.body.selectedVehicle];

        console.log('Selected Vehicle IDs:', req.body.selectedVehicle);
        const user = await User.findById(req.session.login);
        
        const formData = new reqForm({
            userId: user._id,
            address: req.body.address,
            selectedVehicle: selectedVehicleIds,
            city: req.body.city,
            event: req.body.event,
            requestorName: req.body.requestorName,
            status: 'pending',
        });

        const savedRequest = await formData.save();

        //
        const allSelectedVehicleIds = [...new Set(savedRequest.selectedVehicle)];
        // Using $in operator to find vehicles with the extracted IDs
        const selectedVehicles = await Vehicle.find({ _id: { $in: allSelectedVehicleIds } });
        console.log(selectedVehicles)
        //

        const templatePath = path.join(__dirname, '../views/pdf/pdf-template.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(templateContent, { formData, selectedVehicles: selectedVehicles });
        const createdBy = user._id.toString();
        const savedRequestIdString = savedRequest._id.toString();
        const savedRequestNameString = savedRequest.requestorName.toString();
        const formURL = `public/upload/pdf/${createdBy}/${savedRequestIdString}`;
        const outputFolderPath = path.resolve(__dirname, '../public/upload/pdf/', createdBy, savedRequestIdString);
        try {
            await fs.mkdir(outputFolderPath, { recursive: true });
            console.log('Directory created successfully');
        } catch (error) {
            console.error('Error creating directory:', error);
            return res.status(500).send('Error creating directory');
        }
        const outputPath = path.join(outputFolderPath, `${savedRequestNameString}.pdf`);

        const chromeExecutablePath = './node_modules/@puppeteer/browser/src/browser-data/chrome';
        console.log('Chrome executable path:', chromeExecutablePath);
        try {
            const browser = await puppeteer.launch({
                ...puppeteerConfig,
                args: [
                    "--disable-setuid-sandbox",
                    "--no-sandbox",
                    "--single-process",
                    "--no-zygote",
                ],
                headless: true
            });

            const page = await browser.newPage();
            await page.setContent(html);
            await page.pdf({
                path: outputPath,
                format: 'A4',
                printBackground: true,
            });

            await browser.close();
            console.log('PDF generated successfully');
            savedRequest.formURL = formURL;
            await savedRequest.save();
            req.flash('success', 'Creation Success!');
            //start
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
                                filename: `${savedRequest.requestorName}.pdf`,
                                content: pdfDataUri,
                                encoding: 'base64',
                                contentType: 'application/pdf',
                                path:outputPath
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

            // Constructing the verification link and email content
            const Link = `https://lguk-online.onrender.com/dashboard`;
            const emailContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <p style="color: #000; font-size="18px">Requested By: <strong>${user.fullname}</strong> (${user.assign})</p>
                <p style="color: #000;">Requestor Name: <strong>${savedRequest.requestorName}</strong></p>
                <p>Go to <a href="${Link}" >Dashboard</a>
            </div>
        `;

            sendEmail(
                `lguk-online.onrender.com <${user.email}>`, 
                `emoklo101@gmail.com`,
                'Request Form',
                emailContent ,
                outputPath
            );
            //end
            return res.redirect('/');
        } catch (error) {
            console.error('Error launching browser:', error);
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).send('Internal Server Error');
    }
};
