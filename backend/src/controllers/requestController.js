const Request = require("../models/Request")
const Donation = require("../models/Donation")
const Notification = require("../models/Notification")

// CREATE REQUEST
exports.createRequest = async (req, res) => {
  try {
    const { donationId } = req.body

    if (!donationId) {
      return res.status(400).json({ message: "Donation ID is required" })
    }

    // Fetch donation to get donor ID
    const donation = await Donation.findById(donationId)
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" })
    }

    console.log("🔍 DEBUG CREATE REQUEST:")
    console.log("  Org (sender) ID:", req.user.id)
    console.log("  Donation ID:", donationId)
    console.log("  Donation donorId:", donation.donorId)

    const request = new Request({
      donationId,
      organizationId: req.user.id,
      donorId: donation.donorId
    })

    await request.save()

    console.log("✅ Request saved:", {
      _id: request._id,
      donorId: request.donorId,
      organizationId: request.organizationId,
      donationId: request.donationId
    })

    // 🔥 CREATE NOTIFICATION FOR DONOR
    await Notification.create({
      recipient: donation.donorId,
      sender: req.user.id,
      message: `New request for donation: ${donation.title}`,
      type: "request",
      relatedId: request._id
    })

    res.status(201).json({
      message: "Request created successfully",
      request
    })
  } catch (error) {
    console.error("❌ Error creating request:", error)
    res.status(500).json({
      message: "Server error",
      error
    })
  }
}

// GET ALL REQUESTS
exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("organizationId", "name email")

    res.json(requests)
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    })
  }
}

// GET SINGLE REQUEST
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("organizationId", "name email")

    if (!request) {
      return res.status(404).json({ message: "Request not found" })
    }

    res.json(request)
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    })
  }
}

// GET MY REQUESTS (for donors - requests sent to them)
exports.getMyRequests = async (req, res) => {
  try {
    console.log("🔍 DEBUG GET MY REQUESTS (DONOR):")
    console.log("  Donor ID:", req.user.id)
    console.log("  Donor ID type:", typeof req.user.id)

    const requests = await Request.find({ donorId: req.user.id })
      .populate("organizationId", "name email")
      .populate("donationId")

    console.log("✅ Found requests:", requests.length)
    if (requests.length > 0) {
      console.log("  First request:", {
        _id: requests[0]._id,
        donorId: requests[0].donorId,
        organizationId: requests[0].organizationId,
        donationId: requests[0].donationId
      })
    } else {
      console.log("⚠️  No requests found matching donorId:", req.user.id)
    }

    res.json(requests)
  } catch (error) {
    console.error("❌ Error fetching my requests:", error)
    res.status(500).json({
      message: "Server error",
      error
    })
  }
}

// GET MY REQUESTS SENT (for organizations - requests they sent)
exports.getMyRequestsSent = async (req, res) => {
  try {
    const requests = await Request.find({ organizationId: req.user.id })
      .populate("organizationId", "name email")

    res.json(requests)
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    })
  }
}

// GET NOTIFICATIONS (for current user)
exports.getNotifications = async (req, res) => {
  try {
    console.log("🔍 DEBUG GET NOTIFICATIONS:")
    console.log("  User ID:", req.user.id)
    console.log("  User type:", typeof req.user.id)

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name email")
      .sort({ createdAt: -1 })

    console.log("✅ Found notifications:", notifications.length)
    if (notifications.length > 0) {
      console.log("  First notification:", {
        _id: notifications[0]._id,
        recipient: notifications[0].recipient,
        sender: notifications[0].sender,
        message: notifications[0].message
      })
    } else {
      console.log("⚠️  No notifications found for recipient:", req.user.id)
    }

    res.json(notifications)
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    res.status(500).json({
      message: "Server error",
      error
    })
  }
}