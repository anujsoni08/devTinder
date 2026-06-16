const express = require("express");
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = 7777;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

const { userAuth } = require("./middlewares/auth");

app.use("/", authRouter);
app.use("/", userAuth, profileRouter);
app.use("/", userAuth, requestRouter);
app.use("/", userAuth, userRouter);

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
