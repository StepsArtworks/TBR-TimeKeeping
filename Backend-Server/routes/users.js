const db = require('../services/db');
const requiredparms = require("../middleware/requiredparms.js");


// JWT secret key - in production this should be in environment variables
const JWT_SECRET = 'your-secret-key';

module.exports = function (app) {


    // Middleware to verify JWT token



}