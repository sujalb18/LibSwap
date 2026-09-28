const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

const LOAN_DAYS = 14;
const privateFields = '+loanHistory +reservationQueue +circulationVersion';
const sameUser = (left, right) => Boolean(left && right) && String(left) === String(right);

// Older records have only reservedBy; preserve their place at the front.
const getQueue = book => {
  const queue = [...(book.reservationQueue || [])];
  if (book.reservedBy && !queue.some(entry => sameUser(entry.user, book.reservedBy))) {
    queue.unshift({ user: book.reservedBy, reservedAt: null, readyAt: book.borrowedBy ? null : (book.updatedAt || new Date(0)) });
  }
  return queue;
};

exports.borrowBook = async (req, res) => {
  try {
    const userId = req.user.userId;   // ⭐ Secure user ID from token
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    if (!book.available) {
      return res.status(400).json({
        success: false,
        message: "Book is already borrowed or unavailable"
      });
    }

    book.borrowedBy = userId;
    book.available = false;

    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book borrowed successfully",
      data: book
    });

  } catch (error) {
    console.error("Borrow error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
