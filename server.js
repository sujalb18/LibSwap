const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const bookRequestRoutes = require('./routes/bookRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const bookRoutes = require('./routes/bookRoutes');

require('dotenv').config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('LibSwap server is running');
});

// Authentication routes from the shared project
app.use('/api/auth', authRoutes);
app.use('/api/book-requests', bookRequestRoutes);
app.use('/api/notifications', notificationRoutes);

// Catalogue routes for US02
app.use('/api/books', bookRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
    });