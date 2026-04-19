const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'CloneTube Backend API running!' });
});

// Routes
app.use('/api/videos', require('./routes/videos'));
app.use('/api/auth', require('./routes/auth'));

// Mongo connect
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clonetube')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Mongo error:', err.message));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
