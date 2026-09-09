const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes.js");

require('dotenv').config();

const app = express();
app.use(express.json());

// Serve frontend files
app.use(express.static("public"));

// Dashboard API routes
app.use("/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('LibSwap server is running');
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Catalogue routes
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
