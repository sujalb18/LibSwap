const Book = require("../models/Book");

exports.reserveBook = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    book.reservedBy = userId;
    book.available = false;   // ⭐ REQUIRED FIX

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