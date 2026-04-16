const express = require("express");
const router = express.Router();

const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getMyDonations,
  getNearbyDonations,
} = require("../controllers/donationController");

const authMiddleware = require("../middleware/authMiddleware");

// CREATE DONATION (protected)
router.post("/", authMiddleware, createDonation);

// GET NEARBY DONATIONS
router.get("/nearby", getNearbyDonations);

// GET MY DONATIONS (protected)
router.get("/my-donations", authMiddleware, getMyDonations);

// GET ALL DONATIONS
router.get("/", getDonations);

// GET SINGLE DONATION
router.get("/:id", getDonationById);

// UPDATE DONATION (protected)
router.put("/:id", authMiddleware, updateDonation);

// DELETE DONATION (protected)
router.delete("/:id", authMiddleware, deleteDonation);

module.exports = router;