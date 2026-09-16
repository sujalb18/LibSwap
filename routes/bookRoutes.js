const express = require('express');
const router = express.Router();

const { getBooks, addBook, deleteBook } = require('../controllers/bookController');

// This route gets all books or searches books using ?search=
router.get('/', getBooks);
router.delete('/:id', deleteBook);

// This route is for adding a book
router.post('/', addBook)

// Exporting the router so server.js can use it
module.exports = router;