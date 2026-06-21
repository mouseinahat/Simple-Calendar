# Firebase Setup for Simple Calendar - Step 5

Step 5 adds independent calendar rooms.

## What changed

The URL now controls the room:

```txt
/simple-calendar/?room=abc123
```

Each room stores separate data in Firestore:

```txt
rooms
  abc123
    users
      user-id-1
        name: "Siwon"
        color: "#4f46e5"
        dates: ["2026-06-02", "2026-06-08"]

  another-room
    users
      user-id-2
        name: "Minji"
        color: "#dc2626"
        dates: ["2026-06-10"]
```

## Important

If Step 4 already worked, copy the same `firebaseConfig` object from your old `script.js` into this Step 5 `script.js`.

Replace this part:

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

with your real Firebase values.

## How to use

1. Open the website.
2. Click **Create New Room**.
3. Click **Copy Room Link**.
4. Send that link to other people.
5. Everyone who opens the same link will see the same room data.

## Limitation

There is no password yet. Anyone with the room link can open the room.
Password protection will be added in Step 6.
