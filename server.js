const mongoose = require('mongoose');
const app = require('./app');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB first
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        // Start the Express application after MongoDB connects
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            'MongoDB connection failed:',
            error.message
        );
    });