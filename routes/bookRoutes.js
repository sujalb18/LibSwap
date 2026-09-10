const express = require('express');
const router = express.Router();

const {
    getBooks,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');

// This route gets all books or searches books using ?search=
router.get('/', getBooks);

// Add a new library book
router.post('/', createBook);

// Update an existing library book
router.put('/:id', updateBook);

// Delete an existing library book
router.delete('/:id', deleteBook);

// Exporting the router so server.js can use it
module.exports = router;