const indexController = require('../Controllers/indexController');
const requestController = require('../Controllers/requestController');
const loginController = require('../Controllers/loginController');
const vehicleController = require('../Controllers/vehicleController');
module.exports = function(app){

    app.get('/', indexController.index);
    app.post('/submit', requestController.index);
    app.get('/login', loginController.index);
    app.post('/login', loginController.submit);
    app.post('/logout', loginController.logout);
    app.post('/create/vehicle', vehicleController.doCreate)
    //Utilities
    app.get('/alert', (req,res) => {
        res.render('alert')
    })
    app.get('/typo', (req,res) => {
        res.render('typo')
    })
    app.get('/tab', (req,res) => {
        res.render('tab')
    })
    app.get('/table', (req,res) => {
        res.render('table')
    })
    app.get('/switch', (req,res) => {
        res.render('switch')
    })
    app.get('/register', (req,res) => {
        res.render('register')
    })
    app.get('/progress-bar', (req,res) => {
        res.render('progress-bar')
    })
    app.get('/modal', (req,res) => {
        res.render('modal')
    })
    app.get('/map', (req,res) => {
        res.render('map')
    })
    
    app.get('/inbox', (req,res) => {
        res.render('inbox')
    })
    app.get('/grid', (req,res) => {
        res.render('grid')
    })
    app.get('/form', (req,res) => {
        res.render('form')
    })
   
}