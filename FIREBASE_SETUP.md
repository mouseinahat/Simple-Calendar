# Firebase Setup for Step 6

This version adds password-protected calendar rooms.

## 1. Copy your Firebase config

Open `script.js` and replace:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

with the Firebase config from your project.

## 2. Firestore data structure

```txt
rooms
 └─ roomId
      id: roomId
      title: "친구 모임"
      password: "1234"
      users
       └─ userId
            name: "Siwon"
            color: "#4f46e5"
            dates: ["2026-06-12", "2026-06-13"]
```

## 3. MVP security note

This is MVP password protection.

The password check happens in browser JavaScript. This is okay for early testing with friends, but it is not strong security.

For a real public app, add stronger protection later using one of these:

- Firebase Authentication
- Firestore Security Rules
- Firebase Cloud Functions / backend password verification
- Firebase App Check

## 4. GitHub Pages

Upload these files to your repository root:

```txt
index.html
style.css
script.js
FIREBASE_SETUP.md
```

Then enable GitHub Pages from the `main` branch and `/root` folder.
