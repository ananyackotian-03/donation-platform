const express = require("express")
const router = express.Router()

const {
  createRequest,
  getRequests,
  getRequestById,
  getMyRequests,
  getMyRequestsSent,
  getNotifications
} = require("../controllers/requestController")

const authMiddleware = require("../middleware/authMiddleware")

// CREATE REQUEST
router.post("/", authMiddleware, createRequest)

// GET MY REQUESTS (for donors) - specific routes before generic /:id
router.get("/my-requests", authMiddleware, getMyRequests)

// GET MY REQUESTS SENT (for organizations)
router.get("/my-requests-sent", authMiddleware, getMyRequestsSent)

// GET NOTIFICATIONS (for current user)
router.get("/notifications", authMiddleware, getNotifications)

// GET ALL REQUESTS
router.get("/", getRequests)

// GET SINGLE REQUEST
router.get("/:id", getRequestById)

module.exports = router