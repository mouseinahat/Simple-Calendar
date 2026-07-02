# Simple Calendar

A lightweight collaborative calendar for finding the best meeting date.

Built with:

* GitHub Pages
* Firebase Firestore
* Vanilla JavaScript

---

# Overview

Simple Calendar helps groups find the best meeting date by allowing multiple users to mark their available days on a shared calendar.

Users can:

* Create a calendar room
* Share a room link
* Protect rooms with a password
* Select or create a room-based profile
* Mark available dates
* Quickly toggle the current month or weekdays from the calendar header
* See other participants' availability
* Automatically find the best meeting dates
* Confirm one final meeting date for the room

---

# Live Demo

```txt
https://mouseinahat.github.io/Simple-Calendar/
```

---

# Features

## Shared Calendar Rooms

Create independent calendar rooms.

Each room has:

* Unique Room ID
* Room Title
* Password Protection
* Independent Data Storage

Example:

```txt
https://mouseinahat.github.io/Simple-Calendar/?room=45ad9524-ce23-4d1f-ac58-ba44c2573065
```

---

## Password Protected Rooms

Room creators can set a password.

Visitors must enter the correct password before accessing the calendar.

---

## Real-Time Collaboration

Powered by Firebase Firestore.

Changes made by one user are automatically synchronized with all participants.

---

## User Availability Tracking

Each participant can:

* Create a profile inside a room
* Protect that profile with a password
* Use the same profile across browsers and devices
* Edit their name and personal color
* Set or change their profile password
* Delete their profile when it is no longer needed
* Mark dates as Available, Maybe, or Unavailable

Availability is displayed directly on the shared calendar.

Profiles are stored in Firestore under:

```txt
rooms/{roomId}/profiles/{profileId}
  availabilityStatus
  availability
```

Profile passwords are stored as SHA-256 hashes, not plaintext.
Legacy `availability` arrays remain supported and are treated as Available dates.

---

## Best Date Recommendation

The application uses weighted availability scoring:

* Available = 2
* Maybe = 1
* Unavailable = 0
* Ranked recommendations

Example:

```txt
1. June 13 - 8 score
2. June 14 - 6 score
3. June 20 - 4 score
```

---

## Final Date Confirmation

After reviewing recommended dates, a room participant can confirm one final meeting date.

The confirmed date is stored on the room document:

```txt
rooms/{roomId}
  finalDate
  finalDateSetAt
```

All users in the room see the confirmed date banner in real time.

---

## Multi-Language Support

Supported languages:

* 한국어
* English

Language can be switched directly within the application.

---

## Mobile-Friendly Design

Responsive layout supports:

* Desktop
* Tablet
* Mobile devices

---

## Calendar Header Quick Selection

Users can quickly select or deselect dates in the current month:

* Click the month title to toggle every date in the displayed month.
* Click a weekday header to toggle every matching weekday.

---

## Developer Administration

The developer page can:

* View all rooms
* Filter rooms by All, Active, or Deleted
* Soft-delete active rooms
* Restore deleted rooms

---

# Technology Stack

Frontend:

* HTML
* CSS
* JavaScript

Backend:

* Firebase Firestore

Hosting:

* GitHub Pages

---

# Project Structure

```txt
Simple-Calendar/

├── index.html
├── style.css
├── script.js

├── README.md
├── Updates.md

└── FIREBASE_SETUP.md
```

---

# Current Version

```txt
v1.4.0
```

---

# Planned Features

## Prompt 15

Date Notes

* Per-date notes
* Display author and timestamp
* Real-time sync

---

# Security Notes

Firebase API keys are public by design for client applications.

Protection is provided through:

* Firebase Security Rules
* API Restrictions
* Website Restrictions

Never rely solely on client-side passwords for sensitive applications.

---

# License

MIT License

```
Simple Calendar © 2026
```
