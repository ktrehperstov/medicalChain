'use strict';
var fabric_client = require('fabric-client');
var fabric_ca_client = require('fabric-ca-client')

var client = fabric_client.loadFromConfig('/Users/konstantintrehperstov/go/src/fabric-samples/basic-network/connection.yaml');

client.initCredentialStores().then((nothing) => {
    client.setUserContext({username:'admin', password:'adminpw'}).then((admin) => {
        
    })
}) 

