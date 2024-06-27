// Import the SHA256 hash function from the crypto-js library
const SHA256 = require("crypto-js/sha256");

// Import the elliptic library for elliptic curve cryptography
const EC = require("elliptic").ec;
// Create a new elliptic curve instance using the secp256k1 curve
const ec = new EC("secp256k1");

// Define the Transaction class to represent a transaction in the blockchain
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress; // Address of the sender
    this.toAddress = toAddress; // Address of the receiver
    this.amount = amount; // Amount being transferred
  }

  // Method to calculate the hash of the transaction
  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString(); // Convert the hash to a string
  }

  // Method to sign the transaction using the sender's private key
  signTransaction(signingKey) {
    // Ensure that the signing key matches the sender's address
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You cannot sign transactions for other wallets");
    }

    // Calculate the transaction hash
    const hashTX = this.calculateHash();
    // Sign the hash using the private key
    const sig = signingKey.sign(hashTX, "base64");
    // Store the signature in DER (Distinguished Encoding Rules) format
    this.signature = sig.toDER("hex");
  }

  // Method to check if the transaction is valid
  isValid() {
    // If the transaction is a mining reward, it is valid by default
    if (this.fromAddress === null) {
      return true;
    }

    // Ensure that the transaction has a signature
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }

    // Get the public key from the sender's address
    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    // Verify the transaction hash against the signature
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

// Define the Block class to represent each block in the blockchain
class Block {
  // Constructor to initialize the block with timestamp, transactions, and previous hash
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp; // Timestamp of block creation
    this.transactions = transactions; // Transactions stored in the block
    this.previousHash = previousHash; // Hash of the previous block in the chain
    this.hash = this.calculateHash(); // Hash of the current block
    this.nonce = 0; // Initialize nonce to 0 for mining purposes
  }

  // Method to calculate the hash of the block based on its properties
  calculateHash() {
    return SHA256(
      this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce
    ).toString(); // Convert the hash to a string
  }

  // Method to mine the block by finding a hash that meets the difficulty criteria
  mineBlock(difficulty) {
    // Loop until the hash starts with a number of zeroes equal to the difficulty
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++; // Increment nonce to change the hash
      this.hash = this.calculateHash(); // Recalculate the hash with the new nonce
    }
    console.log("Block mined: " + this.hash); // Output the mined hash
  }

  // Method to check if all transactions in the block are valid
  hasValidTransactions() {
    // Iterate through each transaction in the block
    for (const tx of this.transactions) {
      // If any transaction is invalid, return false
      if (!tx.isValid()) {
        return false;
      }
    }
    return true; // All transactions are valid
  }
}

// Define the Blockchain class to represent the entire blockchain
class Blockchain {
  // Constructor to initialize the blockchain with a genesis block
  constructor() {
    this.chain = [this.createGenesisBlock()]; // Start the chain with the genesis block
    this.difficulty = 4; // Set the difficulty level for mining blocks
    this.pendingTransactions = []; // Store pending transactions
    this.miningReward = 100; // Set the reward for mining a block
  }

  // Method to create the genesis block (the first block in the chain)
  createGenesisBlock() {
    return new Block("26/06/2024", "Genesis Block", "0"); // Genesis block has a fixed timestamp and no previous hash
  }

  // Method to get the latest block in the chain
  getLatestBlock() {
    return this.chain[this.chain.length - 1]; // Return the last block in the chain array
  }

  // Method to mine the pending transactions and reward the miner
  minePendingTransactions(miningRewardAddress) {
    // Create a new block with the pending transactions
    let block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty); // Mine the block with the set difficulty

    console.log("Block successfully mined!");
    this.chain.push(block); // Add the mined block to the chain

    // Reset the list of pending transactions and include the mining reward transaction
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  // Method to create a new transaction and add it to the list of pending transactions
  addTransaction(transaction) {
    // Ensure that the transaction has from and to addresses
    if(!transaction.fromAddress || !transaction.toAddress){
      throw new Error("Transaction must include from and to addresses");
    }

    // Ensure that the transaction is valid
    if(!transaction.isValid()){
      throw new Error ("Cannot add invalid transaction to chain");
    }

    // Add the transaction to the list of pending transactions
    this.pendingTransactions.push(transaction);
  }

  // Method to get the balance of a specific address
  getBalanceOfAddress(address) {
    let balance = 0; // Initialize balance to 0

    // Iterate through all blocks in the chain
    for (const block of this.chain) {
      // Iterate through all transactions in each block
      for (const trans of block.transactions) {
        // Deduct the amount if the address is the sender
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        // Add the amount if the address is the receiver
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance; // Return the calculated balance
  }

  // Method to check if the blockchain is valid
  isChainValid() {
    // Iterate through all blocks in the chain, starting from the second block
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]; // Current block in the iteration
      const previousBlock = this.chain[i - 1]; // Previous block in the iteration

      // Check if all transactions in the current block are valid
      if(!currentBlock.hasValidTransactions()){
        return false;
      }

      // Check if the hash of the current block is still valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Check if the current block's previous hash matches the hash of the previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true; // If all blocks are valid, return true
  }
}

// Export the Blockchain and Transaction classes for use in other modules
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
