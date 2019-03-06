import express = require('express');
import bodyParser = require('body-parser');
import {FileSystemWallet, GatewayOptions, Gateway} from 'fabric-network'
import path = require('path')

var app = express.application = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'connection.yaml');
const walletPath = path.join(process.cwd(), 'wallet')
const wallet = new FileSystemWallet(walletPath);

const gatewayOptions: GatewayOptions = {
    identity: 'admin',
    wallet,
    discovery: { enabled: false }
};

const gateway = new Gateway();

const channelName = 'mychannel'
const chaincodeId = 'mycc'
const transactionName = 'setClinicalRecord'

app.post('/tests/endpoint', function (req, res) {
    gateway.connect(ccpPath, gatewayOptions).then(_ => {
        console.log("Connecting...")
        return gateway.getNetwork(channelName);
    }).then(network => {
        console.log("Submitting...")
        const contract = network.getContract(chaincodeId);
        return contract.submitTransaction(transactionName, JSON.stringify(req.body))
    }).then(_ => {
        console.log("Sucess!!!")
        res.send('Sucessfully saved form fields for this task at key: ' + 'ClinicalRecord' + req.body.task.id)
        gateway.disconnect()
    }, _ => {
        console.log("Refused!!!")
        res.send('Something went wrong')
    })
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

