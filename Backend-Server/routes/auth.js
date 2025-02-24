const db = require('../services/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const requiredparms = require("../middleware/requiredparms.js");

const JWT_SECRET = 'dinosaur';

module.exports = function (app) {
    app.route(`/login`)
        .post(async function (req, res) {
            const { email, password } = req.body;
            console.log(email, password);

            try {
                // Get user from database
                const user = db.query(`
                SELECT id, email, password, full_name , role, department 
                FROM users 
                WHERE email = ?
            `, [email])[0];
                console.log(user);
                if (!user) {
                    return res.status(401).json({
                        status: 401,
                        message: 'Invalid email or password'
                    });
                }

                // Compare password
                const isValidPassword = await bcrypt.compare(password, user.password);
                console.log(isValidPassword);
                if (!isValidPassword) {
                    return res.status(401).json({
                        status: 401,
                        message: 'Invalid email or password'
                    });
                }

                // Generate JWT token
                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email,
                        role: user.role
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                // Remove password from user object
                delete user.password;

                res.set({
                    'Access-Control-Allow-Origin': 'https://tbrhub.com',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Accept',
                    'Access-Control-Allow-Credentials': 'true'
                });
                return res.status(200).json({
                    token,
                    user
                });

            } catch (err) {
                console.error("Login failed:", err);
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                });
            }
        });

    // Register endpoint
    app.post('/register',
        async function (req, res) {
            const { email, password, full_name, role, department } = req.body;

            try {
                // Check if user already exists
                const existingUser = db.query('SELECT id FROM Users WHERE email = ?', [email]);
                console.log(existingUser);


                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                console.log(hashedPassword);
                // Insert new user
                const result = db.run(`
            INSERT INTO Users (email, password, fullname, role, department)
            VALUES (?, ?, ?, ?, ?)
        `, [email, hashedPassword, full_name, role, department]);

                if (!result.changes) {
                    throw new Error('Failed to create user');
                }

                return res.status(201).json({
                    status: 201,
                    message: 'User created successfully'
                });

            } catch (err) {
                console.error("Registration failed:", err);
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                });
            }
        });
}