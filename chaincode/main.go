package main

import (
	"fmt"
	"errors"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
	"strconv"
)

type MedicalChaincode struct {
}


func (t *MedicalChaincode) Init(stub shim.ChaincodeStubInterface) peer.Response {
	fmt.Println("Initializing chaincode")
	return shim.Success(nil)
}

func (t *MedicalChaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	fmt.Println("Invoking chaincode")
	var creatorOrg, creatorCertIssuer string
	var err error

	creatorOrg, creatorCertIssuer, err = getTxCreatorInfo(stub)
	if err != nil {
		_ = fmt.Errorf("Error extracting creator identity info: %s\n", err.Error())
		return shim.Error(err.Error())
	}
	fmt.Printf("MedicalChain Invoke by '%s', '%s'\n", creatorOrg, creatorCertIssuer)

	function, args := stub.GetFunctionAndParameters()

	if function == "setClinicalRecord" {
		return t.setClinicalRecord(stub, creatorOrg, creatorCertIssuer, args)
	}
	if function == "getClinicalRecord" {
		return t.getClinicalRecord(stub, creatorOrg, creatorCertIssuer, args)
	}


	return shim.Error("Invalid invoke function name")
}

// Get current state of a trade agreement
func (t *MedicalChaincode) getClinicalRecord(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) peer.Response {
	// Проверка на количестов аргументов
	var err error
	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1. Found %d", len(args)))
		return shim.Error(err.Error())
	}
	taskId, err := strconv.Atoi(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	// Get the state from the ledger
	clinicalRecordKey, err := getClinicalRecordKey(stub, taskId)

	if err != nil {
		return shim.Error(err.Error())
	}

	var jsonResp string
	clinicalRecordBytes, err := stub.GetState(clinicalRecordKey)
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + clinicalRecordKey + "\"}"
		return shim.Error(jsonResp)
	}

	if len(clinicalRecordBytes) == 0 {
		jsonResp = "{\"Error\":\"No record found for " + clinicalRecordKey + "\"}"
		return shim.Error(jsonResp)
	}

	fmt.Printf("ClinicalRecord %s has been got\n", clinicalRecordKey)

	return shim.Success(clinicalRecordBytes)
}


func (t *MedicalChaincode) setClinicalRecord(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) peer.Response {
	//Аутентификация пользователя и проверка прав доступа здесь

	// Проверка на количестов аргументов
	var err error
	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	//Сделать анмаршал из arg[0] в объект типа ClinicalRecord
	var clinicalRecord *ClinicalRecord
	clinicalRecordBytes := []byte(args[0])
	err = json.Unmarshal(clinicalRecordBytes, &clinicalRecord)

	//Получить ключ из объекта
	clinicalRecordKey, err := getClinicalRecordKey(stub, clinicalRecord.Task.Id)


	//Взаять текущее состояние по ключу из блокчейна ???

	//Если его нет то запихнуть новый созданный ???

	//Обновить его новым объектом
	err = stub.PutState(clinicalRecordKey, clinicalRecordBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("ClinicalRecord %s has been putted\n", clinicalRecordKey)

	return shim.Success(nil)
}

//Запуск кода
func main() {
	if err := shim.Start(new(MedicalChaincode)); err != nil {
		fmt.Printf("Error starting Trade Workflow chaincode: %s", err)
	}
}

