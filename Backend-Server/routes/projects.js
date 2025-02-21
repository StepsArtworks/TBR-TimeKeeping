
const db = require('../services/db');
const requiredparms = require("../middleware/requiredparms.js");

module.exports = function (app) {
    app.route(`/projects/`)
        .get(function (req, res) {
            let response = { status: 500, data: null, meta: null };
            try {
                const data = db.getall(`SELECT * FROM Projects`);

                response = data;
                return res.status(200).json(response);

            } catch (err) {
                console.log("failed no project");
                response.status = 400;
                response.data = null;
                return res.status(400).json(response);
            }
        })
        .post(requiredparms(["name", "value"]), function (req, res) {
            let response = { status: 400, data: null, meta: 'Error in creating configvalue' };
            const { name, value } = req.body;
            const result = db.run(`INSERT INTO Projects (name, value)VALUES (?, ?)`, { name, value });

            if (result.changes) {
                response.status = 200;
                response.data = result.changes;
            }
            return res.status(response.status).json(response);
        })
    app.route(`Projects/:projectId/tasks`)
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