const express = require("express");
const SwapRequest = require("../models/SwapRequest");
const Book = require("../models/Book");

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { requestedBookId, ownerId, requesterId, offeredBookId, message } = req.body;

    if (!requestedBookId || !ownerId || !requesterId || !offeredBookId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const book = await Book.findById(requestedBookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    if (ownerId === requesterId) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own book"
      });
    }

    const existing = await SwapRequest.findOne({
      requestedBookId,
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

    const swapRequest = new SwapRequest({
      requestedBookId,
      ownerId,
      requesterId,
      offeredBookId,
      message,
      status: "pending"
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
