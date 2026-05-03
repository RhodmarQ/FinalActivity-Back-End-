# Fix Like/Dislike Mutual Exclusivity

## Steps:
- [x] 1. Plan approved
- [x] 2. Add GET /videos/:id/action endpoint in server/routes/videos.js
- [x] 3. Add apiVideos.getUserAction(id) in client/src/api/axios.js
- [x] 4. Update client/src/pages/Watch.jsx to fetch initial user action state
- [x] 5. Test: like → dislike → verify like count decreases (local state + backend sync now correct)
- [x] 6. Complete - Like/dislike fixed
