package main

import (
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"crypto/x509"
)

func getTxCreatorInfo(stub shim.ChaincodeStubInterface) (string, string, error) {
	var mspid string
	var err error
	var cert *x509.Certificate

	mspid, err = cid.GetMSPID(stub)

	if err != nil {
		fmt.Printf("Error getting MSP identity: %s\n", err.Error())
		return "", "", err
	}

	cert, err = cid.GetX509Certificate(stub)
	if err != nil {
		fmt.Printf("Error getting client certificate: %s\n", err.Error())
		return "", "", err
	}

	return mspid, cert.Issuer.CommonName, nil
}

func authenticateMedicalHospital(mspID string, certCN string) bool {
	// Logic for process checking cert attributes for permissions
	return (mspID == MEDICAL_MSP) && (certCN == MEDICAL_CERT_COMMON_NAME)
}

