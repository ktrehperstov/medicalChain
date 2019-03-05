import {FileSystemWallet, GatewayOptions, Gateway, X509WalletMixin} from 'fabric-network'

const FabricCAServices = require('fabric-ca-client');

import path = require('path')
import fs = require('fs')
import YAML = require('yaml')

const walletPath = path.join(process.cwd(), 'wallet')
const wallet = new FileSystemWallet(walletPath);

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'connection.yaml');
const ccpYAML = fs.readFileSync(ccpPath, 'utf8');
const ccp = YAML.parse(ccpYAML);
const caURL = ccp.certificateAuthorities['ca.example.com'].url;
const ca = new FabricCAServices(caURL);

wallet.exists("admin").then(exist => {
    if (exist) {
        return new Promise(function (sucess, reject) {
            reject(new Error('An identity for the admin user "admin" already exists in the wallet'))
        })
    }
    return ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });   
}).then(enrollment => {
    console.log("sucess enroll")
    const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
    wallet.import('admin', identity);
    console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
}, error => {
    console.log(error.message)
})

const gatewayOptions: GatewayOptions = {
    identity: 'admin',
    wallet,
    discovery: { enabled: false }
};

const gateway = new Gateway();

const channelName = 'mychannel'
const chaincodeId = 'mycc'

const transactionName = 'setClinicalRecord'
const arg = `
{
    "task": {
        "id":32896731,
        "text":"steps:",
        "create_date":"2019-01-19T13:36:47Z",
        "last_modified_date":"2019-03-01T12:52:12Z",
        "author":{
            "id":256359,
            "first_name":"Костя",
            "last_name":"Трехперстов2",
            "email":"3kosta@rambler.ru",
            "type":"user"
        },
        "form_id":591227,
        "fields":[
            {"id":1,"type":"text","name":"Text","value":"sd"},
            {"id":2,"type":"number","name":"Number","value":12}
        ]
    },
    "user_id":330165
}
`
gateway.connect(ccpPath, gatewayOptions).then(_ => {
    console.log("Connecting...")
    return gateway.getNetwork(channelName);
}).then(network => {
    console.log("Submitting...")
    const contract = network.getContract(chaincodeId);
    return contract.submitTransaction(transactionName, arg)
}).then(_ => {
    console.log("Sucess!!!")
    gateway.disconnect()
})
