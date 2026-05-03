# Subscriptions Page Not Showing After Subscribe

## Issue
User subscribes but subscriptions don't appear on /subscriptions page.

## Plan
1. Add debug logs to Subscriptions.jsx loadSubscriptions()
2. Test flow: login -> subscribe -> check /subscriptions console
3. Fix based on logs (likely user.id format or backend auth/populate)

Steps pending user test.

