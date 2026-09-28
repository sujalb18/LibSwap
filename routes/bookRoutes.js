const express = require('express');
const router = express.Router();

const {
    getBooks,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');

const authMiddleware = require('../middleware/authMiddleware');
const staffOnly = require('../middleware/staffOnly');

// Anyone can browse or search the library catalogue
router.get('/', getBooks);

// Only authenticated staff can add library books
router.post(
    '/',
    authMiddleware,
    staffOnly,
    createBook
);

// Only authenticated staff can update library books
router.put(
    '/:id',
    authMiddleware,
    staffOnly,
    updateBook
);

// Only authenticated staff can delete library books
router.delete(
    '/:id',
    authMiddleware,
    staffOnly,
    deleteBook
);

module.exports = router;