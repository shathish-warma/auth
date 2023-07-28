const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require("./db/dbConnect");
const bcrypt = require("bcrypt");
const User = require("./db/userModel");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require('express-validator');

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// Authentication endpoint with authentication middleware
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});

// Rate limiting: Limit requests from the same IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// Input validation for register endpoint
app.post(
  "/register",
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    // hash the password and create a new user instance
    bcrypt.hash(request.body.password, 10)
      .then((hashedPassword) => {
        const user = new User({
          email: request.body.email,
          password: hashedPassword,
        });

        // save the new user
        user.save()
          .then((result) => {
            response.status(201).send({
              message: "User Created Successfully",
              result,
            });
          })
          .catch((error) => {
            response.status(500).send({
              message: "Error creating user",
              error,
            });
          });
      })
      .catch((e) => {
        response.status(500).send({
          message: "Password was not hashed successfully",
          e,
        });
      });
  });

// Input validation for login endpoint
app.post(
  "/login",
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { email, password } = request.body;

    // Find the user in the database by their email
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return response.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password from the database
        bcrypt.compare(password, user.password)
          .then((isMatch) => {
            if (!isMatch) {
              return response.status(401).json({ message: 'Invalid email or password' });
            }

            // If the password matches, generate a JWT and send it back to the client
            const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
            response.json({ message: 'Login successful', token });
          })
          .catch((error) => {
            response.status(500).send({
              message: 'Error comparing passwords',
              error,
            });
          });
      })
      .catch((error) => {
        response.status(500).send({
          message: 'Error finding the user',
          error,
        });
      });
  }
);

// execute database connection
dbConnect();
module.exports = app;
