const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
  try {
    // Get the token from the authorization header
    const token = await request.headers.authorization.split(" ")[1];

    // Verify if the token matches the supposed origin
    const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");

    // Retrieve the user details of the logged-in user
    const user = await decodedToken;

    // Pass the user down to the endpoints
    request.user = user;

    // Pass down functionality to the endpoint
    next();
  } catch (error) {
    response.status(401).json({
      error: "Invalid request! Authentication failed.",
    });
  }
};
