import express = require('express');
import bodyParser = require('body-parser');
import fabric_client = require('fabric-client');
import fabric_ca_client = require('fabric-ca-client')

var app = express.application = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// var client = fabric_client.loadFromConfig('/Users/konstantintrehperstov/go/src/fabric-samples/basic-network/connection.yaml');

app.post('/tests/endpoint', function (req, res) {
    console.log(req.body)
    res.send(req.body);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

