// Import the Blockchain and Transaction classes from the blockchain module
const {Blockchain, Transaction} = require("./blockchain");

// Import the elliptic library for elliptic curve cryptography
const EC = require("elliptic").ec;
// Create a new elliptic curve instance using the secp256k1 curve
const ec = new EC("secp256k1");

// Create a key pair from a private key string
const myKey = ec.keyFromPrivate("5d883a182fa8b41dcb5125f2a2f4a759a8da09ceac97469fc6b40e2a6c162766");
// Extract the public key in hexadecimal format (this is the wallet address)
const myWalletAddress = myKey.getPublic("hex");

// Create a new blockchain instance
let driCoin = new Blockchain();

// Create a new transaction from the wallet address to another address
const tx1 = new Transaction(myWalletAddress, "public key goes here", 10);
// Sign the transaction with the private key
tx1.signTransaction(myKey);
// Add the transaction to the list of pending transactions in the blockchain
driCoin.addTransaction(tx1);

// Start the mining process to include pending transactions into the blockchain
console.log("\nStarting the miner...");
driCoin.minePendingTransactions(myWalletAddress); // Mine the pending transactions

// Get and display the balance of the specified address
console.log("\nBalance of Filip is ", driCoin.getBalanceOfAddress(myWalletAddress));

// Uncommenting the following line would tamper with the blockchain by changing the amount of a transaction
// driCoin.chain[1].transactions[0].amount = 1;

// Check if the blockchain is still valid after potential tampering
console.log("Is chain valid?", driCoin.isChainValid());
