const express = require('express');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const dashboardRoutes =
    require('./routes/dashboardRoutes.js');
const moderationRoutes =
    require('./routes/moderationRoutes.js');

const app = express();

// Allows Express to read JSON sent in request bodies
app.use(express.json());

// Serve frontend files
app.use(express.static('public'));

// Main route
app.get('/', (req, res) => {
    res.send('LibSwap server is running');
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Catalogue and book management routes
app.use('/api/books', bookRoutes);

// Dashboard API routes
app.use('/dashboard', dashboardRoutes);

// Staff content moderation routes
app.use('/api/moderation', moderationRoutes);

module.exports = app;