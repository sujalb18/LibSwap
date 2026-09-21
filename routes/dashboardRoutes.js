const express = require("express");
const Book = require("../models/Book.js");
const SwapRequest = require("../models/SwapRequest.js");

const router = express.Router();

// ⭐ My Books (owned)
router.get("/my-books/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const books = await Book.find({ ownerId: userId });

    return res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error("Dashboard my-books error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ⭐ Borrowed Books
router.get("/borrowed/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const books = await Book.find({ borrowedBy: userId });

    return res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error("Dashboard borrowed error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ⭐ Reserved Books
router.get("/reservations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const books = await Book.find({ reservedBy: userId });

    return res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error("Dashboard reservations error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ⭐ Swap Requests Received
router.get("/swap-received/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const receivedRequests = await SwapRequest.find({ ownerId: userId })
      .populate("requestedBookId", "title author")
      .populate("offeredBookId", "title author")
      .populate("requesterId", "fullName email");

    return res.status(200).json({ success: true, data: receivedRequests });
  } catch (error) {
    console.error("Dashboard swap-received error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ⭐ Swap Requests Sent
router.get("/swap-sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const sentRequests = await SwapRequest.find({ requesterId: userId })
      .populate("requestedBookId", "title author")
      .populate("offeredBookId", "title author")
      .populate("ownerId", "fullName email");

    return res.status(200).json({ success: true, data: sentRequests });
  } catch (error) {
    console.error("Dashboard swap-sent error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
