// auth.js

const jwt = require("jsonwebtoken");
const secretKey = require("./generateSecretKey"); // Import the secret key

module.exports = async (request, response, next) => {
  console.log("Auth middleware executed!");
  try {
    // Get the token from the authorization header
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new Error("Invalid token! Authentication failed.");
    }

    const token = authorizationHeader.split(" ")[1];

    // Verify the token
    const decodedToken = jwt.verify(token, 'your-secret-key');

    // Retrieve the user details from the token payload
    const userId = decodedToken.userId;

    // Attach the user details to the request object for use in other endpoints
    request.user = { userId };

    // Continue to the next middleware or the endpoint handler
    next();
  } catch (error) {
    response.status(401).json({
      error: error.message || "Invalid request! Authentication failed.",
    });
  }
};
