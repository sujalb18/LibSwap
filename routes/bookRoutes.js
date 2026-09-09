const express = require('express');
const router = express.Router();

const { getBooks } = require('../controllers/bookController');

// This route gets all books or searches books using ?search=
router.get('/', getBooks);

// Exporting the router so server.js can use it
module.exports = router;