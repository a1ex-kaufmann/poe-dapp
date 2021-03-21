var express = require("express");  
var app = express();  
var server = require("http").createServer(app);
var io = require("socket.io")(server);
const fs = require('fs');

let rawdata = fs.readFileSync('config.json');
let settings = JSON.parse(rawdata);
console.log("Listen http://localhost:8080")

server.listen(8080);

app.use(express.static("public"));

app.get("/", function(req, res){
	res.sendFile(__dirname + "/public/html/index.html");
})

var Web3 = require("web3");

web3 = new Web3(new Web3.providers.HttpProvider(settings.nodeUrl));	

var proofContract = web3.eth.contract([
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "owner",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "fileHash",
				"type": "string"
			}
		],
		"name": "LogFileAddedStatus",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "owner",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "fileHash",
				"type": "string"
			}
		],
		"name": "set",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "fileHash",
				"type": "string"
			}
		],
		"name": "get",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "owner",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]);
var proof = proofContract.at(settings.contractAddress);

app.get("/submit", function(req, res){
	var fileHash = req.query.hash;
	var owner = req.query.owner;

	proof.set.sendTransaction(owner, fileHash, {
		from: web3.eth.accounts[0],
	}, function(error, transactionHash){
		if (!error)
		{
			res.send(transactionHash);
		}
		else
		{
			res.send("Error");
		}
	})
})

app.get("/getInfo", function(req, res){
	var fileHash = req.query.hash;

	var details = proof.get.call(fileHash);

	res.send(details);
})

proof.LogFileAddedStatus().watch(function(error, result){
	if(!error)
	{
		if(result.args.status == true)
		{
			io.send(result);
		}
	}
})