# Firebase Setup for Simple Calendar Step 4

## 1. Create a Firebase project

Go to Firebase Console and create a new project.

## 2. Add a Web app

Inside the Firebase project, add a Web app. Firebase will give you a config object like this:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Copy your real values into `script.js`.

## 3. Enable Firestore

Open Firestore Database and create a database.

For early development, you can start in test mode. Before real public use, replace test rules with safer rules.

## 4. Data structure

The app stores data like this:

```txt
rooms/{roomId}
rooms/{roomId}/users/{userId}
```

Example user document:

```js
{
  name: "Siwon",
  color: "#4f46e5",
  dates: ["2026-06-12", "2026-06-13"],
  updatedAt: serverTimestamp()
}
```

## 5. Shared room links

The room is controlled by the URL query string:

```txt
index.html?room=demo-room
```

Everyone who opens the same room link will see the same shared calendar data.
