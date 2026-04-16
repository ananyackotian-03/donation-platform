const express = require("express");
const router = express.Router();

const {
  createRequest,
  getRequests,
  getRequestById,
  getMyRequests,
  getMyRequestsSent,
  getNotifications,
} = require("../controllers/requestController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createRequest);

router.get("/my-requests", authMiddleware, getMyRequests);

router.get("/my-requests-sent", authMiddleware, getMyRequestsSent);

router.get("/notifications", authMiddleware, getNotifications);

router.get("/", getRequests);

router.get("/:id", getRequestById);

module.exports = router;