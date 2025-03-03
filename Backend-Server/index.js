var fs = require("fs");
var path = require('path');
var cors = require('cors')
var morgan = require('morgan');
const express = require('express')
const bodyParser = require('body-parser');
const app = express();
var port = 7777;
app.use(cors({
  origin: 'https://api.tbrhub.com'
}));

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

require('./routes/auth.js')(app);
require('./routes/projects.js')(app);

console.log(`TBR Timekeeping - Listening on Port ${port}`);
app.listen(port);