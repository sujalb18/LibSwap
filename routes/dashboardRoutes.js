const express = require("express");
const Book = require("../models/Book.js");
const SwapRequest = require("../models/SwapRequest.js");

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

/* -------------------------------------------
   GET SWAP REQUESTS RECEIVED
-------------------------------------------- */
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

/* -------------------------------------------
   GET SWAP REQUESTS SENT
-------------------------------------------- */
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


/* -------------------------------------------
   ADD A PERSONAL BOOK (Tied to user ID)
-------------------------------------------- */
router.post("/my-books/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, author, genre } = req.body;

    if (!title || !author) {
      return res.status(400).json({ success: false, message: "Title and author are required" });
    }

    const newBook = new Book({
      title: title.trim(),
      author: author.trim(),
      genre: genre ? genre.trim() : "",
      ownerId: userId, // Attach the student's ID here
      available: true
    });

    const savedBook = await newBook.save();
    return res.status(201).json({ success: true, data: savedBook });
  } catch (error) {
    console.error("Dashboard add book error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------------------------
   DELETE A PERSONAL BOOK (Only if owned by user)
-------------------------------------------- */
router.delete("/my-books/:userId/:bookId", async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    // IMPORTANT: Ensure the book exists AND belongs to the user trying to delete it
    const book = await Book.findOne({ _id: bookId, ownerId: userId });
    
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found or permission denied" });
    }

    await Book.findByIdAndDelete(bookId);
    return res.status(200).json({ success: true, message: "Book deleted" });
  } catch (error) {
    console.error("Dashboard delete book error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;