import express from "express";
import Book from "../models/Book.js";
import SwapRequest from "../models/SwapRequest.js";

const router = express.Router();

// Get books listed by the logged-in user
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



// Get swap requests received by the logged-in user
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

    return res.status(200).json({
      success: true,
      data: receivedRequests
    });

  } catch (error) {
    console.error("Dashboard swap-received error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get swap requests sent by the logged-in user
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

    return res.status(200).json({
      success: true,
      data: sentRequests
    });

  } catch (error) {
    console.error("Dashboard swap-sent error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});



export default router;
