const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
    },

    password: String,

    role: {
      type: String,
      enum: ['donor', 'organization', 'admin'],
      default: 'donor'
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,

    resetToken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);