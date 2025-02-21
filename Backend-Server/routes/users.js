const db = require('../services/db');
const requiredparms = require("../middleware/requiredparms.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT secret key - in production this should be in environment variables
const JWT_SECRET = 'your-secret-key';

module.exports = function (app) {
    app.route(`/login/`)
        .get(function (req, res) {
            let response = { status: 500, data: null, meta: null };
            try {
                const data = db.getall(`SELECT id, email, fullname, role, department FROM Users`);
                response.status = 200;
                response.data = data;
                response.meta = -1;
            } catch (err) {
                console.error("Failed to fetch users:", err);
                response.status = 400;
                response.data = null;
            }
            return res.status(response.status).json(response);
        })
        .post(requiredparms(["email", "password"]), async function (req, res) {
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

    // Middleware to verify JWT token
    const verifyToken = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 401,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid token'
            });
        }
    };

    // Protected routes
    app.route(`/projects/:projectId/tasks`)
        .get(verifyToken, function (req, res) {
            let response = { status: 500, data: null, meta: null };
            try {
                const data = db.getall(`
                    SELECT * FROM Tasks 
                    WHERE project_id = ?
                `, [req.params.projectId]);

                response.status = 200;
                response.data = data;
                response.meta = -1;

            } catch (err) {
                console.error("Failed to fetch tasks:", err);
                response.status = 400;
                response.data = null;
            }
            return res.status(response.status).json(response);
        });
}