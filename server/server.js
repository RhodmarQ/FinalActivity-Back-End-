require("dotenv").config();
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

// Start server with MongoDB Atlas
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is required for MongoDB Atlas connection. Please set it in your .env file.');
    }
    
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Atlas connected');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup error:', err.message);
    process.exit(1);
  }
};

startServer();
