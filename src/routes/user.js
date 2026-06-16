const express = require("express");

const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const user = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// Get all the pending connection requests
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    // populate("fromUserId", ["firstName", "lastName"])

    res.json({
      status: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (error) {}
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionsRequests = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
        },
        {
          fromUserId: loggedInUser._id,
        },
      ],
      status: "accepted",
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionsRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }

      row.fromUserId;
    });

    res.json({ data });
  } catch (error) {
    res.status(400).json({
      message: err.message,
    });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // User should see all cards except
    // 1. his own card
    // 2. his connection
    // 3. his ignored
    // 4. already sent connect request to

    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // find all connection requests (sent + request)

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: loggedInUser._id,
        },
        {
          toUserId: loggedInUser._id,
        },
      ],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();

    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString(), req.toUserId.toString());
    });

    const users = await user
      .find({
        $and: [
          {
            _id: { $nin: Array.from(hideUsersFromFeed) },
          },
          {
            _id: { $ne: loggedInUser._id },
          },
        ],
      })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = userRouter;
