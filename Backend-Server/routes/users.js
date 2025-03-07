const db = require('../services/db');
const requiredparms = require("../middleware/requiredparms.js");
const verifytoken = require("../middleware/verifytoken.js");
const bcrypt = require('bcryptjs');

module.exports = function (app) {
    app.route('/users')
        // Get all users
        .get(verifytoken, function (req, res) {
            let response = { status: 500, data: null, meta: null };
            try {
                const data = db.getall(`
                    SELECT id, email, full_name, role, department, 
                           vacation_balance, sick_balance, personal_balance 
                    FROM Users
                `);

                response.status = 200;
                response.data = data;
                return res.status(200).json(response);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                });
            }
        })
        // Create new user
        .post(verifytoken, requiredparms(["email", "password", "full_name", "role", "department"]), 
        async function (req, res) {
            const { email, password, full_name, role, department } = req.body;
            
            try {
                // Check if user already exists
                const existingUser = db.query('SELECT id FROM Users WHERE email = ?', [email])[0];
                if (existingUser) {
                    return res.status(400).json({
                        status: 400,
                        message: 'User already exists'
                    });
                }

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Insert new user with default balances
                const result = db.run(`
                    INSERT INTO Users (
                        email, password, full_name, role, department,
                        vacation_balance, sick_balance, personal_balance
                    ) VALUES (?, ?, ?, ?, ?, 0, 0, 0)
                `, [email, hashedPassword, full_name, role, department]);

                if (!result.changes) {
                    throw new Error('Failed to create user');
                }

                return res.status(201).json({
                    status: 201,
                    message: 'User created successfully'
                });
            } catch (err) {
                console.error("Failed to create user:", err);
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                });
            }
        });

    app.route('/users/:userId')
        // Get single user
        .get(verifytoken, function (req, res) {
            try {
                const user = db.query(`
                    SELECT id, email, full_name, role, department,
                           vacation_balance, sick_balance, personal_balance
                    FROM Users 
                    WHERE id = ?
                `, [req.params.userId])[0];

                if (!user) {
                    return res.status(404).json({
                        status: 404,
                        message: 'User not found'
                    });
                }

                return res.status(200).json({
                    status: 200,
                    data: user
                });
            } catch (err) {
                console.error("Failed to fetch user:", err);
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                });
            }
        })
        // Update user
        .put(verifytoken, function (req, res) {
            const { email, full_name, role, department, 
                    vacation_balance, sick_balance, personal_balance } = req.body;
            
            try {
                // Check if user exists
                const user = db.query('SELECT id FROM Users WHERE id = ?', 
                    [req.params.userId])[0];
                
                if (!user) {
                    return res.status(404).json({
                        status: 404,
                        message: 'User not found'
                    });
                }

                // Update user
                const result = db.run(`
                    UPDATE Users 
                    SET email = COALESCE(?, email),
                        full_name = COALESCE(?, full_name),
                        role = COALESCE(?, role),
                        department = COALESCE(?, department),
                        vacation_balance = COALESCE(?, vacation_balance),
                        sick_balance = COALESCE(?, sick_balance),
                        personal_balance = COALESCE(?, personal_balance)
                    WHERE id = ?
                `, [email, full_name, role, department, 
                    vacation_balance, sick_balance, personal_balance,
                    req.params.userId]);

                if (!result.changes) {
                    throw new Error('Failed to update user');
                }

                return res.status(200).json({
                    status: 200,
                    message: 'User updated successfully'
                });
            } catch (err) {
                console.error("Failed to update user:", err);
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                });
            }
        })
        // Delete user
        .delete(verifytoken, function (req, res) {
            try {
                // Check if user exists
                const user = db.query('SELECT id FROM Users WHERE id = ?', 
                    [req.params.userId])[0];
                
                if (!user) {
                    return res.status(404).json({
                        status: 404,
                        message: 'User not found'
                    });
                }

                // Delete user
                const result = db.run('DELETE FROM Users WHERE id = ?', 
                    [req.params.userId]);

                if (!result.changes) {
                    throw new Error('Failed to delete user');
                }

                return res.status(200).json({
                    status: 200,
                    message: 'User deleted successfully'
                });
            } catch (err) {
                console.error("Failed to delete user:", err);
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error'
                });
            }
        });
}