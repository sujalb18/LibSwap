const express = require('express');
const router = express.Router();

const { getBooks, addBook } = require('../controllers/bookController');

// This route gets all books or searches books using ?search=
router.get('/', getBooks);

// This route is for adding a book
router.post('/', addBook)

// Exporting the router so server.js can use it
module.exports = router;