# CloneTube Server Setup

## 1. Install MongoDB
- Download MongoDB Community: https://www.mongodb.com/try/download/community
- Install & start service (Windows: services.msc → MongoDB → Start)
- Or use MongoDB Atlas (free): Create cluster, get connection string

## 2. Setup .env
```
cp .env.example .env
```
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clonetube  # or Atlas URI
JWT_SECRET=mySuperSecretKey123ChangeThis
```

## 3. Run
```
npm install
npm start  # or npm run dev
```
✅ Server on http://localhost:5000

**Test API:** curl http://localhost:5000/api/videos
