const Review = require('../models/Review');

// Get all reviews that are waiting for moderation
const getPendingReviews = async (req, res) => {
    try {
        const pendingReviews = await Review.find({
            moderationStatus: 'pending'
        })
            .populate(
                'bookId',
                'title author'
            )
            .populate(
                'userId',
                'fullName email'
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message:
                'Pending reviews retrieved successfully',
            count: pendingReviews.length,
            reviews: pendingReviews
        });

    } catch (error) {
        console.error(
            'Unable to retrieve pending reviews:',
            error
        );

        res.status(500).json({
            message:
                'Unable to retrieve pending reviews'
        });
    }
};

module.exports = {
    getPendingReviews
};