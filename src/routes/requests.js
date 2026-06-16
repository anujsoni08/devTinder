const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const fromUserId = req.user._id;

      const { toUserId, status } = req.params;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }

      const isValidToUserId = await user.validateUserId(toUserId);
      if (!isValidToUserId) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      // If there is an existing ConnectionRequest
      const existingConnectRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectRequest) {
        return res
          .status(400)
          .json({ message: "A connection request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      await connectionRequest.save();

      res.json({
        message: user.firstName + " is " + status + " in " + toUser.firstName,
        data: connectionRequest,
      });
    } catch (error) {
      res.status(400).send("ERROR: " + error.message);
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;

      const loggedInUser = req.user;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus) {
        return res.status(400).json({
          message: status + " not allowed",
        });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection request not found",
        });
      }

      connectionRequest.status = status;
      await connectionRequest.save();

      res.json({
        message: "Request " + status + " successfully",
        data: connectionRequest,
      });
    } catch (error) {
      res.status(400).send("ERROR: " + error.message);
    }
  },
);

module.exports = requestRouter;
