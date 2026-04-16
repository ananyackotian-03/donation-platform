const Request = require("../models/Request");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");

exports.createRequest = async (req, res) => {
  try {
    const { donationId } = req.body;

    if (!donationId) {
      return res.status(400).json({ message: "Donation ID is required" });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const request = new Request({
      donationId,
      organizationId: req.user.id,
      donorId: donation.donorId,
    });

    await request.save();

    await Notification.create({
      recipient: donation.donorId,
      sender: req.user.id,
      message: `New request for donation: ${donation.title}`,
      type: "request",
      relatedId: request._id,
    });

    res.status(201).json({
      message: "Request created successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("organizationId", "name email");

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("organizationId", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ donorId: req.user.id })
      .populate("organizationId", "name email")
      .populate("donationId");

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getMyRequestsSent = async (req, res) => {
  try {
    const requests = await Request.find({ organizationId: req.user.id })
      .populate("organizationId", "name email");

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};