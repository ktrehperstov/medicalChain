
var bodyParser = require('body-parser')
var express = require('express');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/tests/endpoint', function (req, res) {
    console.log(req.body.fields)
    res.send('Hello from express. Got task');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

