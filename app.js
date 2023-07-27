const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require("./db/dbConnect");
const bcrypt = require("bcrypt");
const User = require("./db/userModel");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
const rateLimit = require("express-rate-limit");

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
const { body, validationResult } = require('express-validator');
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

// execute database connection 
dbConnect();
module.exports = app;
