const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const reqForm = require('../models/request');
const User = require('../models/user');

module.exports.index = async (req, res) => {
    try {
        if (!req.session.login) {
            return res.redirect('/login');
        }

        const user = await User.findById(req.session.login);
        const formData = new reqForm({
            userId: user._id,
            address: req.body.address,
            city: req.body.city,
            event: req.body.event,
            requestorName: req.body.requestorName,
            status: 'pending',
        });

        const savedRequest = await formData.save();

        const templatePath = path.join(__dirname, '../views/pdf/pdf-template.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(templateContent, { formData });

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

        const chromeExecutablePath = '/opt/render/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome'; 
        console.log('Chrome executable path:', chromeExecutablePath);
        const browser = await puppeteer.launch({
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
              ],
            headless: true
            
          });
        // Create a new page
        
        try {
            
            const page = await browser.newPage();
            // Generate PDF
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
        });

        await browser.close();

        console.log('PDF generated successfully');
        savedRequest.formURL = formURL;
        await savedRequest.save();
        return res.redirect('/');
        // Set the HTML content of the page
        await page.setContent(html);
            // rest of your code...
        } catch (error) {
            console.error('Error launching browser:', error);
        }
        
    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).send('Internal Server Error');
    }
};
