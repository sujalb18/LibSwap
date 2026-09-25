const Book = require("../models/Book");

exports.borrowBook = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    // ⭐ Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    // ⭐ Check if already borrowed
    if (!book.available) {
      return res.status(400).json({
        success: false,
        message: "Book is already borrowed or unavailable"
      });
    }

    // ⭐ Borrow logic
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
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
