const express = require("express");
const router = express.Router();
const Request = require("../models/request");

/**
 * POST /api/request
 * Public: Create a new request (inquiry or tour)
 */
router.post("/", async (req, res) => {
  try {
    const {
      propertyId,
      userId,
      name,
      email,
      mobile,
      requestType,
      message,
      date,
      time
    } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required" });
    }

    const newRequest = new Request({
      propertyId,
      userId,
      name,
      email,
      mobile,
      requestType,
      message,
      date,
      time,
      status: "Pending"
    });

    await newRequest.save();

    res.status(201).json({ success: true, message: "Request submitted successfully", request: newRequest });
  } catch (err) {
    console.error("POST /api/request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/request
 * Optional: Get all requests (for admin)
 */
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error("GET /api/request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/request/property/:propertyId
 * Get requests for a specific property
 */
router.get("/property/:propertyId", async (req, res) => {
  try {
    const requests = await Request.find({ propertyId: req.params.propertyId }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error("GET /api/request/property error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/request/user/:userId
 * Get requests for a specific user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error("GET /api/request/user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PUT /api/request/:id/status
 * Update request status
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    
    res.json({ success: true, message: "Status updated", request });
  } catch (err) {
    console.error("PUT /api/request/:id/status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
