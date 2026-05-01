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
const mongodbUri = process.env.MONGO_URI;
if (!mongodbUri) {
  console.error("MONGO_URI environment variable is not set");
  process.exit(1);
}

mongoose
  .connect(mongodbUri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    retryWrites: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// test route
app.get("/", (req, res) => {
  res.send("Server working");
});

// start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});