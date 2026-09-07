const express = require('express');
const mongoose = require('mongoose');
const swapRoutes = require('./routes/swapRoutes.js');
require('dotenv').config();

const app = express();

app.use(express.json());

// Serve frontend files
app.use(express.static("public"));

// Swap API routes
app.use("/swap", swapRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('LibSwap server is running');
});

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
