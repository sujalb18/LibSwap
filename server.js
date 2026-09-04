const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const dashboardRoutes = require("./routes/dashboardRoutes.js");

const app = express();

app.use(express.json());

// SERVE FRONTEND FILES
app.use(express.static("public"));

// DASHBOARD API ROUTES
app.use("/dashboard", dashboardRoutes);

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
