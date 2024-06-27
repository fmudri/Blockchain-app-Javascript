// Import the elliptic library for elliptic curve cryptography
const EC = require("elliptic").ec;
// Create a new elliptic curve instance using the secp256k1 curve
const ec = new EC("secp256k1");

// Generate a new key pair using the elliptic curve
const key = ec.genKeyPair();
// Extract the public key from the key pair in hexadecimal format
const publicKey = key.getPublic("hex");
// Extract the private key from the key pair in hexadecimal format
const privateKey = key.getPrivate("hex");

// Print the public key to the console
console.log();
console.log("Public key: ", publicKey);
console.log();
// Print the private key to the console
console.log("Private key: ", privateKey);
