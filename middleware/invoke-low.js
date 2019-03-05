'use strict';
var fabric_client = require('fabric-client');
var fabric_ca_client = require('fabric-ca-client')
var util = require('util');

var client = fabric_client.loadFromConfig('/Users/konstantintrehperstov/go/src/fabric-samples/basic-network/connection.yaml');
var tx_id = null
var channel = client.getChannel("mychannel")
var peer = client.getPeer("peer0.org1.example.com")

var chaincodeName = 'mycc'
var chaincodeFunctionName = 'setClinicalRecord'

client.initCredentialStores().then((res) => {
    if (res) {
        return client.setUserContext({username:'admin', password:'adminpw'})
    }
    else {
        console.log("failed init credential stores")
        throw new Error("failed init stores")
    }
}).then((admin) => {
    console.log("admin has logged in")
    tx_id = client.newTransactionID()
    const request = {
        chaincodeId : chaincodeName,
        fcn: chaincodeFunctionName,
        args: ['{"task":{"id":32896731,"text":"steps:","create_date":"2019-01-19T13:36:47Z","last_modified_date":"2019-03-01T12:52:12Z","author":{"id":256359,"first_name":"Костя","last_name":"Трехперстов2","email":"3kosta@rambler.ru","type":"user"},"form_id":591227,"fields":[{"id":1,"type":"text","name":"Text","value":"sd"},{"id":2,"type":"number","name":"Number","value":12}]},"user_id":330165}'],
        txId: tx_id
    }

    return channel.sendTransactionProposal(request)
}).then((results) => {
    var proposalResponses = results[0];
    var proposal = results[1];
    
    let isProposalGood = proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200

    if (isProposalGood) {
        console.log('Transaction proposal was good');
		console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"', proposalResponses[0].response.status, proposalResponses[0].response.message));

		// build up the request for the orderer to have the transaction committed
		var request = {
			proposalResponses: proposalResponses,
			proposal: proposal
		};

		// set the transaction listener and set a timeout of 30 sec
		// if the transaction did not get committed within the timeout period,
		// report a TIMEOUT status
		var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
		var promises = [];

		var sendPromise = channel.sendTransaction(request);
		promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

		// get an eventhub once the fabric client has a user assigned. The user
        // is required bacause the event registration must be signed
		let event_hub = channel.newChannelEventHub(peer);

		// using resolve the promise so that result status may be processed
		// under the then clause rather than having the catch clause process
		// the status
		let txPromise = new Promise((resolve, reject) => {
			let handle = setTimeout(() => {
				event_hub.unregisterTxEvent(transaction_id_string);
				event_hub.disconnect();
				resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
			}, 3000);
			event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
				// this is the callback for transaction event status
				// first some clean up of event listener
				clearTimeout(handle);

				// now let the application know what happened
				var return_status = {event_status : code, tx_id : transaction_id_string};
				if (code !== 'VALID') {
					console.error('The transaction was invalid, code = ' + code);
					resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
				} else {
					console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
					resolve(return_status);
				}
			}, (err) => {
				//this is the callback if something goes wrong with the event registration or processing
				reject(new Error('There was a problem with the eventhub ::'+err));
			},
				{disconnect: true} //disconnect when complete
			);
			event_hub.connect();

		});
		promises.push(txPromise);

		return Promise.all(promises);
	} else {
        console.error('Transaction proposal was bad')
		console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
	}
}).then((results) => {
	console.log('Send transaction promise and event listener promise have completed');
	// check the results in the order the promises were added to the promise all list
	if (results && results[0] && results[0].status === 'SUCCESS') {
		console.log('Successfully sent transaction to the orderer.');
	} else {
		console.error('Failed to order the transaction. Error code: ' + results[0].status);
	}

	if(results && results[1] && results[1].event_status === 'VALID') {
		console.log('Successfully committed the change to the ledger by the peer');
	} else {
		console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
	}
}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
});


