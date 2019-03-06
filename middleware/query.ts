import {FileSystemWallet, GatewayOptions, Gateway} from 'fabric-network'

import path = require('path')

const walletPath = path.join(process.cwd(), 'wallet')
const wallet = new FileSystemWallet(walletPath);

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'connection.yaml');

const gatewayOptions: GatewayOptions = {
    identity: 'admin',
    wallet,
    discovery: { enabled: false }
};

const gateway = new Gateway();

const channelName = 'mychannel'
const chaincodeId = 'mycc'

const transactionName = 'getClinicalRecord'
const arg = '35122264'

gateway.connect(ccpPath, gatewayOptions).then(_ => {
    console.log("Connecting...")
    return gateway.getNetwork(channelName);
}).then(network => {
    console.log("Submitting...")
    const contract = network.getContract(chaincodeId);
    return contract.evaluateTransaction(transactionName, arg)
}).then(buffer => {
    console.log("Sucess!!!")
    console.log(buffer.toString('utf8'))
    gateway.disconnect()
})
