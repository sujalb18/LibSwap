const express = require("express");
const Book = require("../models/Book.js");

const router = express.Router();

/* -------------------------------------------
   GET MY BOOKS (Owned)
-------------------------------------------- */
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

/* -------------------------------------------
   GET BORROWED BOOKS
-------------------------------------------- */
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

/* -------------------------------------------
   GET RESERVED BOOKS
-------------------------------------------- */
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

module.exports = router;
