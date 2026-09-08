const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

require('dotenv').config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('LibSwap server is running');
});

app.get('/api/student', (req, res) => {
    res.json({
        name: process.env.STUDENT_NAME,
        studentId: process.env.STUDENT_ID
    });
});

app.use('/api/auth', authRoutes);

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