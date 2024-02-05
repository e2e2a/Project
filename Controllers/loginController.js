const SITE_TITLE = 'Online LGU Katipunan Appointment System'
const User = require('../models/user');

module.exports.index = (req,res) => {
    res.render('login', {
        site_title: SITE_TITLE,
        title: 'Login'
    })
}

module.exports.submit = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).send('Invalid email');
        }

        user.comparePassword(req.body.password, (error, valid) => {
            if (error) {
                return res.status(403).send('Forbidden');
            }
            if (!valid) {
                return res.status(400).send('Invalid password');
            }
            req.session.login = user.id;
            res.redirect('/');
        });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

module.exports.logout = (req, res) => {
    const loginId = req.session.login;
    req.session.destroy((err) => {
        if (err) {
            console.error('error destroying session', err);
        } else {
            console.log('user logout', loginId)
            res.redirect('/login');
        }
    })
}