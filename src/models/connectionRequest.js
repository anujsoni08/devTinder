const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid ID!`,
      },
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid ID!`,
      },
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "accepted", "rejected", "interested"],
        message: `{VALUE} is incorrect type`,
      },
    },
  },
  { timestamps: true },
);

connectionRequestSchema.index({ fromUserId: 1 });

connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;

  // Check of the fromUserId is same as toUserId

  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself!");
  }
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = ConnectionRequest;
