var fs = require("fs");
var path = require('path');
var morgan = require('morgan');
const express = require('express')
const bodyParser = require('body-parser');
const app = express();
var port = 7777;

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
    flags: 'a'
  })
app.use(morgan('combined', {
    stream: accessLogStream
  }))

  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(bodyParser.json());

require('./routes/config.js')(app);
const db = require('./services/db');
db.GenerateTables();

console.log(`My Server Name - Listening on Port ${port}`);
app.listen(port);