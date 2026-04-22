require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

// Start server with MongoDB
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // If no MONGO_URI, use MongoDB Memory Server (for development)
    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/clonetube') {
      console.log('Starting MongoDB Memory Server...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('MongoDB Memory Server started');
    }
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup error:', err.message);
    process.exit(1);
  }
};

startServer();
