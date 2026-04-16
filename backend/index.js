const cors = require("cors");

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./src/routes/authRoutes");
const donationRoutes = require("./src/routes/donationRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);

// DB connect
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/daansetu", {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    retryWrites: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// test route
app.get("/", (req, res) => {
  res.send("Server working");
});

// start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});