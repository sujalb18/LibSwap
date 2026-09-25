const express = require('express');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const path = require('path');

const app = express();

// Allows Express to read JSON sent in request bodies
app.use(express.json());

// Serve frontend files
app.use(express.static('public'));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Catalogue and book management routes
app.use('/api/books', bookRoutes);

// Dashboard API routes
app.use('/dashboard', dashboardRoutes);

module.exports = app;