const Book = require("../models/Book");

exports.reserveBook = async (req, res) => {
  try {
    const userId = req.user.userId;   // ⭐ Secure user ID from token
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    if (book.borrowedBy) {
      return res.status(400).json({
        success: false,
        message: "Book is already borrowed"
      });
    }

    if (book.reservedBy && book.reservedBy.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "Book is already reserved by another user"
      });
    }

    book.reservedBy = userId;
    book.available = false;

    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book reserved successfully",
      data: book
    });

  } catch (error) {
    console.error("Reserve error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
