const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const { validateSignUpData } = require("../utils/validation"); // Import the validation function

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  validateSignUpData(req);

  const { firstName, lastName, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ firstName, lastName, email, password: passwordHash });

  try {
    const savedUser = await user.save();

    const token = await savedUser.getJWT(); // Generate a JWT token for the newly created user

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set cookie expiration to 1 day
    });

    res.json({ message: "User created successfully", data: savedUser });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); // Find the user in the database by email

  if (!user) {
    throw new Error("Invalid credentials");
  }

  try {
    const isPasswordValid = user.validatePassword(password); // Validate the provided password against the stored hash

    if (isPasswordValid) {
      const token = await user.getJWT(); // Generate a JWT token for the authenticated user

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.send("Login successful", user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout successful");
});

module.exports = authRouter;
