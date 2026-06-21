# Step 8 v0.8.2 Firestore Timeout Fix

This release adds explicit Firebase config validation and 12-second timeouts around room creation and password checks.

If the app stops at "방을 생성하는 중입니다" or "방 비밀번호를 확인하는 중입니다", it will now show a concrete Firebase troubleshooting message instead of hanging forever.

Common causes:
- Firebase config was not pasted into `script.js`.
- Google Cloud API key website restrictions do not include `https://mouseinahat.github.io/*` and `https://mouseinahat.github.io/Simple-Calendar/*`.
- API restrictions do not allow Cloud Firestore API.
- Firestore Database was not created.
- Firestore Rules block read/write during development.
