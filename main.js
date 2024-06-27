// Import the SHA256 hash function from the crypto-js library
const SHA256 = require("crypto-js/sha256");

// Define the Block class to represent each block in the blockchain
class Block {
  // Constructor to initialize the block with index, timestamp, data, and previous hash
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index; // Block index (position in the blockchain)
    this.timestamp = timestamp; // Timestamp of block creation
    this.data = data; // Data stored in the block (e.g., transaction data)
    this.previousHash = previousHash; // Hash of the previous block in the chain
    this.hash = this.calculateHash(); // Hash of the current block
    /* * A nonce (short for “number used once”) is a randomly generated value that serves as a security measure.
     * It’s commonly used to prevent cross-site scripting (XSS) attacks.
     * Specifically, nonces are employed to verify the legitimacy of certain requests, such as inline scripts or styles.*/
    this.nonce = 0; // Initialize nonce to 0 for mining purposes
  }

  // Method to calculate the hash of the block based on its properties
  calculateHash() {
    return SHA256(
      this.index +
        this.timestamp +
        JSON.stringify(this.data) +
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
}

// Define the Blockchain class to represent the entire blockchain
class Blockchain {
  // Constructor to initialize the blockchain with a genesis block
  constructor() {
    this.chain = [this.createGenesisBlock()]; // Start the chain with the genesis block
    this.diffculty = 4; // Set the difficulty level for mining blocks
  }

  // Method to create the genesis block (the first block in the chain)
  createGenesisBlock() {
    return new Block(0, "26/06/2024", "Genesis Block", "0"); // Genesis block has index 0 and no previous hash
  }

  // Method to get the latest block in the chain
  getLatestBlock() {
    return this.chain[this.chain.length - 1]; // Return the last block in the chain array
  }

  // Method to add a new block to the chain
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash; // Set the previous hash to the hash of the latest block
    newBlock.mineBlock(this.diffculty); // Mine the new block with the current difficulty level
    this.chain.push(newBlock); // Add the new block to the chain
  }

  // Method to check if the blockchain is valid
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]; // Current block in the iteration
      const previousBlock = this.chain[i - 1]; // Previous block in the iteration

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

// Create a new blockchain instance
let driCoin = new Blockchain();

// Add new blocks to the blockchain
console.log("Mining block 1...");
driCoin.addBlock(new Block(1, "27/06/2024", { amount: 4 }));

console.log("Mining block 2...");
driCoin.addBlock(new Block(2, "27/06/2024", { amount: 8 }));


