const Book = require("../models/Book");

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
