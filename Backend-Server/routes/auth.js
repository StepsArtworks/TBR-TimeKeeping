const db = require('../services/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const requiredparms = require("../middleware/requiredparms.js");

const JWT_SECRET = 'dinosaur';

module.exports = function (app) {
    app.route(`/login`)
        .post(async function (req, res) {
            const { email, password } = req.body;

            try {
                // Get user from database
                const user = db.getOne(`
                SELECT id, email, password, fullname as full_name, role, department 
                FROM Users 
                WHERE email = ?
            `, [email]);

                if (!user) {
                    return res.status(401).json({
                        status: 401,
                        message: 'Invalid email or password'
                    });
                }

                // Compare password
                const isValidPassword = await bcrypt.compare(password, user.password);
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
    app.post('/register', requiredparms(["email", "password", "full_name", "role", "department"]),
        async function (req, res) {
            const { email, password, full_name, role, department } = req.body;

            try {
                // Check if user already exists
                const existingUser = db.getOne('SELECT id FROM Users WHERE email = ?', [email]);
                if (existingUser) {
                    return res.status(400).json({
                        status: 400,
                        message: 'User already exists'
                    });
                }

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

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