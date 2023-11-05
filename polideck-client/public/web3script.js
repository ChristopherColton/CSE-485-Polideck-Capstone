//npm install web3

const Web3 = require("web3");
const contractABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "setValue",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getValue",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

//Init web3 using local host node
const web3 = new Web3("http://localhost:8080");

//Set the contract address and account address
const contractAddress = "CONTRACTADDRESS"; //need to create this using smart contracts/Solidity
const accountAddress = "ACCOUNT ADDRESS";

//Create the contract
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

//Get value of contract
contractInstance.methods
  .getValue()
  .call({ from: accountAddress }, (error, result) => {
    if (!error) {
      console.log("The current value is: " + result);
    } else {
      console.error(error);
    }
  });

//contract value init
const newValue = 42;
//get send txn
web3.eth.getTransactionCount(accountAddress, (error, nonce) => {
  const data = contractInstance.methods.setValue(newValue).encodeABI();
  const tx = {
    from: accountAddress,
    to: contractAddress,
    data: data,
    nonce: nonce,
  };
  web3.eth.sendTransaction(tx, (error, hash) => {
    if (!error) {
      console.log("Transaction hash: " + hash);
    } else {
      console.error(error);
    }
  });
});
