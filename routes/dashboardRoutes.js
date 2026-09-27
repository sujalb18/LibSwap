const express = require("express");
const Book = require("../models/Book.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

/* -------------------------------------------
   GET MY BOOKS (Owned)
-------------------------------------------- */
router.get("/my-books/:userId", authMiddleware, async (req, res) => {
  try {
    const tokenUserId = req.user.userId;
    const { userId } = req.params;

    if (tokenUserId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You can only view your own books." 
      });
    }

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
router.get("/borrowed/:userId", authMiddleware, async (req, res) => {
  try {
    const tokenUserId = req.user.userId;
    const { userId } = req.params;

    if (tokenUserId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You can only view your own borrowed books." 
      });
    }

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
router.get("/reservations/:userId", authMiddleware, async (req, res) => {
  try {
    const tokenUserId = req.user.userId;
    const { userId } = req.params;

    if (tokenUserId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You can only view your own reservations." 
      });
    }

    const books = await Book.find({ reservedBy: userId });
    return res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error("Dashboard reservations error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------------------------
   ADD A PERSONAL BOOK (Owned by User)
-------------------------------------------- */
router.post("/my-books/:userId", authMiddleware, async (req, res) => {
  try {
    const tokenUserId = req.user.userId;
    const { userId } = req.params;

    if (tokenUserId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You can only add books to your own account." 
      });
    }

    let { title, author, genre } = req.body;

    if (typeof title !== 'string' || typeof author !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid data format." });
    }

    title = title.trim();
    author = author.trim();
    genre = typeof genre === 'string' ? genre.trim() : "";

    if (!title || !author) {
      return res.status(400).json({ success: false, message: "Title and author cannot be empty or just spaces." });
    }

    if (title.length > 100 || author.length > 50 || genre.length > 30) {
      return res.status(400).json({ success: false, message: "Input exceeds maximum allowed length." });
    }

    const existingBook = await Book.findOne({ title, author, ownerId: tokenUserId });
    if (existingBook) {
      return res.status(400).json({ success: false, message: "You have already added this book." });
    }

    const newBook = new Book({
      title,
      author,
      genre,
      ownerId: tokenUserId,
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
   DELETE A PERSONAL BOOK
-------------------------------------------- */
router.delete("/my-books/:userId/:bookId", authMiddleware, async (req, res) => {
  try {
    const tokenUserId = req.user.userId;
    const { userId, bookId } = req.params;

    if (tokenUserId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You can only delete your own books." 
      });
    }

    const book = await Book.findOne({ _id: bookId, ownerId: tokenUserId });
    
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found or permission denied." });
    }

    if (book.borrowedBy || book.reservedBy) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete this book because it is currently borrowed or reserved." 
      });
    }

    await Book.findByIdAndDelete(bookId);
    return res.status(200).json({ success: true, message: "Book deleted successfully." });
  } catch (error) {
    console.error("Dashboard delete book error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;