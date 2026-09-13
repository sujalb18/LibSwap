const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

require('dotenv').config();

const app = express();

app.use(express.json());

// This lets Express show frontend files from the public folder
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('LibSwap server is running');
});

// Authentication routes from the shared project
app.use('/api/auth', authRoutes);

// Catalogue routes for US02
app.use('/api/books', bookRoutes);

if (require.main === module) mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
    });

module.exports = app;
