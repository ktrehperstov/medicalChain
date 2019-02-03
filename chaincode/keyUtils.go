package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"strconv"
)

func getClinicalRecordKey(stub shim.ChaincodeStubInterface, record ClinicalRecord) (string, error) {
	task_id := strconv.Itoa(record.Task.Id)

	tradeKey, err := stub.CreateCompositeKey("ClinicalRecord", []string{task_id})

	if err != nil {
		return "", err
	}
	return tradeKey, nil
}
