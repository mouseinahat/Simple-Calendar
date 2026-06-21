# Firebase Setup for Simple Calendar

## 1. Create Firebase Project

1. Go to Firebase Console.
2. Create a new project named `Simple Calendar`.
3. Disable Google Analytics if you want a simpler setup.

## 2. Add Web App

1. Click the Web icon `</>`.
2. App nickname: `simple-calendar-web`.
3. Copy the `firebaseConfig` object.
4. Paste it into `script.js` where the placeholder config is located.

## 3. Create Firestore Database

1. Go to **Firestore Database**.
2. Click **Create database**.
3. Choose **Test mode** for initial testing.
4. Select a nearby region.

## 4. Firestore Data Shape

The app stores data like this:

```txt
rooms
  default-room
    users
      user-id-1
        name: "Siwon"
        color: "#4f46e5"
        dates: ["2026-06-02", "2026-06-08"]
```

## 5. Important Warning

Test mode is only for development. Later, replace it with safer Firestore security rules.
