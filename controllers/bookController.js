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


// This function allows a user to add a new book to the catalogue, eventually will extend to admin as well
const addBook = async (req, res) => {
    try {
        const { title, author, genre } = req.body;

        // This part makes sure that required fields are present
        if (!title || !author) {
            return res.status(400).json({ message: 'Title and Author are required.' });
        }

        // Create a new book based on the schema
        const newBook = new Book({
            title,
            author,
            genre,
            available: true // By default, newly added books are available
        });

        // Save new book to MongoDB
        const savedBook = await newBook.save();

        // Send a success response back to the frontend
        res.status(201).json(savedBook);

    } catch (error) {
        res.status(500).json({
            message: 'Unable to add the book',
            error: error.message
        });
    }
};


// Exporting the function so our route file can use it
module.exports = {
    getBooks,
    addBook
};