# CloneTube Server

Backend API for CloneTube - a YouTube clone application.

## Features

- 🎬 Video management (upload, edit, delete)
- 🔐 User authentication (JWT-based)
- ❤️ Like/Dislike functionality
- 💬 Comments system
- 👥 Subscription system
- 📺 Watch history tracking

## Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or MongoDB Atlas)

## Quick Start

### 1. Install MongoDB

**Option A: Local Installation**
- Download [MongoDB Community](https://www.mongodb.com/try/download/community)
- Install and start the MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster and get connection string

### 2. Setup Environment Variables

`ash
cp .env.example .env
`

Edit .env:
`env
PORT=5001
MONGO_URI=mongodb://localhost:27017/clonetube
JWT_SECRET=your_secure_secret_key_here
`

### 3. Install & Run

`ash
npm install
npm run dev
`

Server runs at: http://localhost:5001

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Videos
- GET /api/videos - Get all videos
- GET /api/videos/:id - Get video details
- POST /api/videos - Upload video
- DELETE /api/videos/:id - Delete video
- PUT /api/videos/:id/likes - Toggle like

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | Yes | Server port (default: 5001) |
| MONGO_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes | Secret key for JWT tokens |

## Technologies

- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

**⚠️ Never commit .env file!**
