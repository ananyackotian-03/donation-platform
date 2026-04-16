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

router.post("/", authMiddleware, createDonation);

router.get("/nearby", getNearbyDonations);

router.get("/my-donations", authMiddleware, getMyDonations);

router.get("/", getDonations);

router.get("/:id", getDonationById);

router.put("/:id", authMiddleware, updateDonation);

router.delete("/:id", authMiddleware, deleteDonation);

module.exports = router;