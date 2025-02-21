
const db = require('../services/db');
const requiredparms = require("../middleware/requiredparms.js");

module.exports = function (app) {
    app.route(`/config/`)
        .get(function (req, res) 
        {
            let response = {status: 500,data: null,meta: null};
            if(req.query.page != null)
            {
                let pagenumber = 1;
                if(req.query.page != null)
                    pagenumber = req.query.page;
                let perpage = 10;
                if(req.query.perpage != null)
                    perpage = req.query.perpage;

                try
                {
                    const offset = (pagenumber - 1) * perpage;
                    const data = db.query(`SELECT * FROM config LIMIT ?,?`, [offset, perpage]);
                    const meta = req.params.page;
                    
                    response.status = 200;
                    response.data = data;
                    response.meta = meta;
                    
                } catch(err){
                    console.log("failed has page");
                    response.status = 400;
                    response.data = null;
                }
            }else
            {
                try
                {
                    const data = db.getall(`SELECT * FROM config`);
                    
                    response.status = 200;
                    response.data = data;
                    response.meta = -1;
                    
                } catch(err){
                    console.log("failed no page");
                    response.status = 400;
                    response.data = null;
                }
            }
            return res.status(response.status).json(response);
        })
        .put(requiredparms(["name","value"]),function (req, res) 
        {
            let response = {status: 400 ,data: null,meta: 'Error in creating configvalue'};
            const {name, value} = req.body;
            const result = db.run(`INSERT INTO config (name, value)VALUES (?, ?)`,{name,value});
  
            if (result.changes) {
                response.status = 200;
                response.data = result.changes;
            }
            return res.status(response.status).json(response);
        })
}