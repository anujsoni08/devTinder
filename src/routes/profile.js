const express = require("express");
const { validateEditProfileData } = require("../utils/validation");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // validate the data
    const user = req.body;
    const isEditAllowed = validateEditProfileData(req);

    if (!isEditAllowed) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(user).forEach((key) => {
      loggedInUser[key] = user[key];
    });

    await loggedInUser.save();

    res.send({
      messaage: loggedInUser.firstName + "'s profile updated successfully",
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = req.user;
    const isOldPasswordValid = user.validatePassword(oldPassword);

    if (!isOldPasswordValid) {
      throw new Error("Invalid old password");
    }

    user.password = newPassword;

    await user.save();

    res.send({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = profileRouter;
