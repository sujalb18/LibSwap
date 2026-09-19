const express = require("express");
const Book = require("../models/Book.js");
const SwapRequest = require("../models/SwapRequest.js");

const router = express.Router();

/* -------------------------------------------
   GET MY BOOKS
-------------------------------------------- */
router.get("/my-books/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const books = await Book.find({ ownerId: userId });

    return res.status(200).json({
      success: true,
      data: books
    });

  } catch (error) {
    console.error("Dashboard my-books error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* -------------------------------------------
   GET SWAP REQUESTS RECEIVED
-------------------------------------------- */
router.get("/swap-received/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const receivedRequests = await SwapRequest.find({ ownerId: userId })
      .populate("bookId", "title")
      .populate("requesterId", "name email");

    // Transform to match frontend
    const formatted = receivedRequests.map(req => ({
      fromUserName: req.requesterId?.name || "Unknown",
      bookTitle: req.bookId?.title || "Unknown",
      status: req.status
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error("Dashboard swap-received error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* -------------------------------------------
   GET SWAP REQUESTS SENT
-------------------------------------------- */
router.get("/swap-sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const sentRequests = await SwapRequest.find({ requesterId: userId })
      .populate("bookId", "title")
      .populate("ownerId", "name email");

    // Transform to match frontend
    const formatted = sentRequests.map(req => ({
      toUserName: req.ownerId?.name || "Unknown",
      bookTitle: req.bookId?.title || "Unknown",
      status: req.status
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error("Dashboard swap-sent error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
