# Login Persistence on Refresh

## Plan Steps:
- [ ] Step 1: Create TODO-LoginPersist.md (current)
- [ ] Step 2: Read server/middleware/auth.js to confirm token validation.
- [ ] Step 3: Edit server/routes/auth.js - Add GET /auth/me endpoint (auth middleware, return full user).
- [ ] Step 4: Edit client/src/context/AuthContext.jsx - Add fetchUser useEffect on mount, validate token/server user.
- [ ] Step 5: Update TODO, test (login → refresh → stays logged in).
- [ ] Step 6: attempt_completion.

Current: Starting implementation.
