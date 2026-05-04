# TODO: Remove dislike and merge to like button

## Information Gathered:
**Client:**
- DislikeButton.jsx: Separate toggle component calling toggleDislike API.
- LikeDislike.jsx: Like toggle calling toggleLike API, has onDislikeChange callback.
- Watch.jsx: Imports/uses both, manages localDislikesCount/userDisliked, calls getUserAction (returns isDisliked).

**Backend:**
- server/routes/videos.js: PUT /:id/dislikes endpoint, /:id/action returns isDisliked.
- server/models/User.js: dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
- server/models/Video.js: dislikesCount: { type: Number, default: 0 }

## Plan:
1. [x] Update client/src/components/LikeDislike.jsx → LikeButton.jsx: Single like/unlike toggle, remove dislike callbacks.
2. [x] Remove client/src/components/DislikeButton.jsx.
3. [x] Update client/src/pages/Watch.jsx: Remove DislikeButton, dislikes state/callbacks/API calls.
4. [x] Backend server/models/User.js: Remove dislikes array.
5. [x] Backend server/models/Video.js: Remove dislikesCount.
6. [ ] Backend server/routes/videos.js: Remove /dislikes endpoint, update /action (no isDisliked), simplify likes toggle (no dislike logic).
7. [x] Update client/src/api/axios.js: Removed toggleDislike.

## Dependent Files:
- client/src/components/LikeDislike.jsx, DislikeButton.jsx
- client/src/pages/Watch.jsx
- server/models/User.js, Video.js
- server/routes/videos.js

## Followup:
- Run migrations or reseed data (dislikes cleared).
- Test like toggle, action fetch.

Confirm plan?
