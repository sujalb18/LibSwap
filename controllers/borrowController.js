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

const circulationView = (book, userId) => {
  const queue = getQueue(book);
  const position = queue.findIndex(entry => sameUser(entry.user, userId));
  const borrowedByMe = sameUser(book.borrowedBy, userId);
  const ready = position === 0 && !book.borrowedBy && Boolean(queue[0].readyAt);
  return {
    _id: book._id, title: book.title, author: book.author, genre: book.genre,
    available: book.available && !book.borrowedBy && !queue.length,
    borrowedByMe,
    borrowedAt: borrowedByMe ? book.borrowedAt : null,
    dueAt: borrowedByMe ? book.dueAt : null,
    loanStatus: borrowedByMe ? (book.dueAt && new Date(book.dueAt) < new Date() ? 'overdue' : 'borrowed') : null,
    reservationStatus: position < 0 ? null : ready ? 'ready' : 'waiting',
    reservationPosition: position < 0 ? null : position + 1,
    reservationCount: queue.length,
    reservedAt: position < 0 ? null : queue[position].reservedAt,
    canBorrow: !book.ownerId && !book.borrowedBy && (queue.length ? ready : book.available),
    canReserve: !book.ownerId && !borrowedByMe && position < 0 && (!book.available || Boolean(book.borrowedBy) || queue.length > 0)
  };
};

const getCirculation = async (req, res) => {
  try {
    const books = await Book.find({ ownerId: null }).select(privateFields).sort({ title: 1, _id: 1 }).lean();
    const history = books.flatMap(book => (book.loanHistory || [])
      .filter(loan => sameUser(loan.user, req.user.userId))
      .map(loan => ({
        _id: loan._id, bookId: book._id, title: book.title, author: book.author,
        borrowedAt: loan.borrowedAt, dueAt: loan.dueAt, returnedAt: loan.returnedAt,
        status: loan.returnedAt ? 'returned' : loan.dueAt && new Date(loan.dueAt) < new Date() ? 'overdue' : 'borrowed'
      })))
      .sort((a, b) => new Date(b.borrowedAt || 0) - new Date(a.borrowedAt || 0));
    return res.json({ success: true, data: books.map(book => circulationView(book, req.user.userId)), history, loanDays: LOAN_DAYS });
  } catch (error) {
    console.error('Circulation lookup failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load your borrowing information.' });
  }
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

exports.getCirculation = getCirculation;
