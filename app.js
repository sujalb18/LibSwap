const express = require('express');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const swapRoutes = require('./routes/swapRoutes');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('LibSwap server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/swap', swapRoutes);

module.exports = app;
