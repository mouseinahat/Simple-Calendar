# Step 9.2 — Firebase Authentication and Firestore Rules

This update adds Firebase Anonymous Authentication to the main calendar app and the developer admin page.

## 1. Enable Anonymous Authentication

Firebase Console:

```txt
Firebase Console
→ Authentication
→ Sign-in method
→ Add new provider
→ Anonymous
→ Enable
→ Save
```

## 2. Update Google Cloud API Restrictions

Because Anonymous Auth uses Firebase Authentication, your API key should allow:

```txt
Cloud Firestore API
Identity Toolkit API
Firebase Installations API
```

Keep Website restrictions enabled:

```txt
https://mouseinahat.github.io/*
https://mouseinahat.github.io/Simple-Calendar/*
http://localhost/*
http://127.0.0.1/*
```

## 3. Firestore Security Rules

For the MVP, use:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;

      match /users/{userId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## 4. Important Security Note

This is better than:

```js
allow read, write: if true;
```

but it is not full production security.

Anonymous users can still access Firestore after being signed in by the app.

For stronger protection later:

- Link room access to authenticated user IDs
- Use Firebase Auth providers such as Google login
- Use custom claims for developer/admin access
- Move sensitive admin actions to Cloud Functions

## 5. Developer Page Warning

The developer page still uses a frontend password.

That is MVP-only.

For production, replace it with:

```txt
Firebase Authentication + admin role check
```
