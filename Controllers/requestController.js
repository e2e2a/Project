const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../puppeteer.config.cjs');
const ejs = require('ejs');
const reqForm = require('../models/request');
const User = require('../models/user');
const Vehicle = require('../models/vehicle')
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
            selectedVehicle:selectedVehicleIds,
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
        const html = ejs.render(templateContent, { formData, selectedVehicles:selectedVehicles });
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
            req.flash('success', 'Creation Success!')
            return res.redirect('/');
        } catch (error) {
            console.error('Error launching browser:', error);
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).send('Internal Server Error');
    }
};
