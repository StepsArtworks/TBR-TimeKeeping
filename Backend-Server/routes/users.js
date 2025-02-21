
const db = require('../services/db');
const requiredparms = require("../middleware/requiredparms.js");

module.exports = function (app) {
    app.route(`/login/`)
        .get(function (req, res) {
            let response = { status: 500, data: null, meta: null };
            try {
                const data = db.getall(`SELECT * FROM Users`);

                response.status = 200;
                response.data = data;
                response.meta = -1;

            } catch (err) {
                console.log("failed no page");
                response.status = 400;
                response.data = null;
            }
            return res.status(response.status).json(response);
        })
        .post(requiredparms(["email", "password"]), function (req, res) {
            let response = {
                token: null,
                user: {
                    id: null,
                    email: null,
                    full_name: null,
                    role: null,
                    department: null
                }
            };

            try {
                const data = db.getall(`SELECT id,email,fullname,role,department FROM Users where email = ?`, email);

                response.status = 200;
                response.data = data;
                response.meta = -1;

            } catch (err) {
                console.log("failed no page");
                response.status = 400;
                response.data = null;
            }
            return res.status(200).json(response);
        });
    app.route(`:projectId/tasks`)
        .get(function (req, res) {
            let response = { status: 500, data: null, meta: null };
            try {
                const data = db.getall(`SELECT * FROM Tasks WHERE project_id = ?`, req.params.projectId);

                response.status = 200;
                response.data = data;
                response.meta = -1;

            } catch (err) {
                console.log("failed no page");
                response.status = 400;
                response.data = null;
            }
            return res.status(response.status).json(response);
        })
}