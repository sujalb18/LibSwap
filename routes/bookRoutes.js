const express = require('express');
const router = express.Router();

const { getBooks, deleteBook } = require('../controllers/bookController');

// This route gets all books or searches books using ?search=
router.get('/', getBooks);
router.delete('/:id', deleteBook);

// Exporting the router so server.js can use it
module.exports = router;