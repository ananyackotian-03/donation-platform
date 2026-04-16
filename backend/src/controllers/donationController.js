const Donation = require("../models/Donation");

exports.createDonation = async (req, res) => {
  try {
    const { title, description, category, condition, imageUrl, latitude, longitude, address } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const donation = new Donation({
      title,
      description,
      category,
      condition,
      imageUrl,
      latitude,
      longitude,
      address,
      donorId: req.user.id,
    });

    await donation.save();

    res.status(201).json({
      message: "Donation item created",
      donation,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donorId", "name email");

    res.json(donations);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donorId", "name email");

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    res.json(donation);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    if (donation.donorId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Donation updated successfully",
      donation: updatedDonation,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    if (donation.donorId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({
      message: "Donation deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      donorId: req.user.id,
    });

    res.json(donations);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getNearbyDonations = async (req, res) => {
  try {
    const { lat, lng, km = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const userLat = Number.parseFloat(lat);
    const userLng = Number.parseFloat(lng);
    const radiusKm = Number.parseFloat(km);

    const donations = await Donation.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    })
      .populate("donorId", "name email");

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const nearbyDonations = donations.map(donation => ({
      ...donation.toObject(),
      distance: calculateDistance(userLat, userLng, donation.latitude, donation.longitude),
    }))
      .filter(donation => donation.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyDonations);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};