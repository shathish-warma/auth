// generateSecretKey.js

const crypto = require('crypto');

// Function to generate a random secure string of the given length
const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

// Generate a random secure string of length 64 (you can adjust the length as desired)
const secretKey = generateRandomString(64);

module.exports = secretKey;
