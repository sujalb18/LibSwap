const Book = require('../models/Book');

// This gets all library books and can also search by title, author or genre
const getBooks = async (req, res) => {
    try {
        // Getting the search word from the URL, for example ?search=harry
        const search = req.query.search;

        // Starting with an empty filter means "show all books"
        let filter = {};

        // If the user typed something in the search box, we create a search filter
        if (search) {
            filter = {
                $or: [
                    // The "i" makes the search ignore capital/lowercase letters
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } },
                    { genre: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Finding the matching books from MongoDB
        const books = await Book.find(filter);

        // Sending the matching books back to the frontend as JSON
        res.status(200).json(books);

    } catch (error) {
        // If something goes wrong, send an error response instead of crashing
        res.status(500).json({
            message: 'Unable to retrieve books',
            error: error.message
        });
    }
};

// NEW: Function to delete a book
const deleteBook = async (req, res) => {
    try {
        // Extract the ID from the request URL
        const bookId = req.params.id;

        // Ask MongoDB to find the book by its unique ID and delete it
        const deletedBook = await Book.findByIdAndDelete(bookId);

        // If no book matched that ID, return a 404 Not Found error
        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        // If successful, send 200 OK status
        res.status(200).json({ message: 'Book deleted successfully.' });

    } catch (error) {
        // If the ID format is invalid, Mongoose throws an error
        res.status(400).json({ 
            message: 'Unable to delete the book. Invalid ID format.',
            error: error.message 
        });
    }
};

// Exporting the function so our route file can use it
module.exports = {
    getBooks,
    deleteBook
};