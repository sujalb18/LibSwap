const express = require('express');

const {
    getPendingReviews
} = require('../controllers/moderationController');

const authMiddleware =
    require('../middleware/authMiddleware');

const staffOnly =
    require('../middleware/staffOnly');

const router = express.Router();

// Only authenticated staff can view content
// waiting for moderation
router.get(
    '/reviews/pending',
    authMiddleware,
    staffOnly,
    getPendingReviews
);

module.exports = router;