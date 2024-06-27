// Import the SHA256 hash function from the crypto-js library
const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Define the Transaction class to represent a transaction in the blockchain
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress; // Address of the sender
    this.toAddress = toAddress; // Address of the receiver
    this.amount = amount; // Amount being transferred
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString(); // Convert the hash to a string
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You cannot sign transactions for other wallets");
    }

    const hashTX = this.calculateHash();
    const sig = signingKey.sign(hashTX, "base64");
    this.signature = sig.toDER("hex");
  }

  isValid() {
    if (this.fromAddress === null) {
      return true;
    }

    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
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

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
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

    if(!transaction.fromAddress || !transaction.toAddress){
      throw new Error("Transaction must include from and to addresses");
    }

    if(!transaction.isValid()){
      throw new Error ("Cannot add invalid transaction to chain");
    }

    this.pendingTransactions.push(transaction);
  }

  // Method to get the balance of a specific address
  getBalanceOfAddress(address) {
    let balance = 0; // Initialize balance to 0

    // Iterate through all blocks in the chain
    for (const block of this.chain) {
      // Iterate through all transactions in each block
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount; // Deduct the amount if the address is the sender
        }

        if (trans.toAddress === address) {
          balance += trans.amount; // Add the amount if the address is the receiver
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

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
