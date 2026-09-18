const mongoose = require('mongoose');

// This schema explains what information we want to store for each library book
const bookSchema = new mongoose.Schema(
    {
        // Book title is required
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Author name is also required
        author: {
            type: String,
            required: true,
            trim: true
        },

        // Genre is optional, but useful for searching later
        genre: {
            type: String,
            trim: true
        },

        // This tells us if the book is currently available to borrow
        available: {
            type: Boolean,
            default: true
        }
    },
    {
        // MongoDB will automatically save createdAt and updatedAt
        timestamps: true
    }
);

// Exporting the Book model so other files can use it
module.exports = mongoose.model('Book', bookSchema);