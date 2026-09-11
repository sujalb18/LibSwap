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

// Add a new library book
const createBook = async (req, res) => {
    try {
        const title = req.body.title?.trim();
        const author = req.body.author?.trim();
        const genre = req.body.genre?.trim();

        if (!title || !author) {
            return res.status(400).json({
                message: 'Title and author are required'
            });
        }

        if (
            req.body.available !== undefined &&
            typeof req.body.available !== 'boolean'
        ) {
            return res.status(400).json({
                message: 'Availability must be true or false'
            });
        }

        const book = new Book({
            title,
            author,
            genre,
            available: req.body.available
        });

        const savedBook = await book.save();

        res.status(201).json({
            message: 'Book added successfully',
            book: savedBook
        });

    } catch (error) {
        res.status(500).json({
            message: 'Unable to add book',
            error: error.message
        });
    }
};

// Update an existing library book
const updateBook = async (req, res) => {
    try {
        const title = req.body.title?.trim();
        const author = req.body.author?.trim();
        const genre = req.body.genre?.trim();

        if (!title || !author) {
            return res.status(400).json({
                message: 'Title and author are required'
            });
        }

        if (
            req.body.available !== undefined &&
            typeof req.body.available !== 'boolean'
        ) {
            return res.status(400).json({
                message: 'Availability must be true or false'
            });
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title,
                author,
                genre,
                available: req.body.available
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedBook) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.status(200).json({
            message: 'Book updated successfully',
            book: updatedBook
        });

    } catch (error) {
        res.status(500).json({
            message: 'Unable to update book',
            error: error.message
        });
    }
};

// Delete a library book
const deleteBook = async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);

        if (!deletedBook) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.status(200).json({
            message: 'Book deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Unable to delete book',
            error: error.message
        });
    }
};

// Exporting the functions so our route file can use them
module.exports = {
    getBooks,
    createBook,
    updateBook,
    deleteBook
};