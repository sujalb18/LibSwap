const express = require("express");
const SwapRequest = require("../models/SwapRequest");
const Book = require("../models/Book");

const router = express.Router();

// Create Swap Request
router.post("/request", async (req, res) => {
  try {
    const { bookId, ownerId, requesterId, offeredBookId, message } = req.body;

    // Validate required fields
    if (!bookId || !ownerId || !requesterId || !offeredBookId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    // Prevent requesting own book
    if (ownerId === requesterId) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own book"
      });
    }

    // Prevent duplicate pending requests
    const existing = await SwapRequest.findOne({
      bookId,
      ownerId,
      requesterId,
      status: "pending"
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this book"
      });
    }

    // Create new swap request
    const swapRequest = new SwapRequest({
      bookId,
      ownerId,
      requesterId,
      offeredBookId,
      message
    });

    await swapRequest.save();

    return res.status(201).json({
      success: true,
      message: "Swap request created successfully",
      data: swapRequest
    });

  } catch (error) {
    console.error("Swap request error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
