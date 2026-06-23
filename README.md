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
* Mark available dates
* See other participants' availability
* Automatically find the best meeting dates

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

* Enter their name
* Choose a personal color
* Select available dates

Availability is displayed directly on the shared calendar.

---

## Best Date Recommendation

The application automatically calculates:

* Number of available users per date
* Most popular dates
* Ranked recommendations

Example:

```txt
1. June 13 — 5 people available
2. June 14 — 4 people available
3. June 20 — 3 people available
```

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

## Quick Selection Tools

Users can quickly select:

```txt
일
월
화
수
목
금
토
모두선택
```

Current month only.

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
v0.8.2
```

---

# Planned Features

## Step 8.1

Quick Select Toggle

* Click once → Select
* Click again → Deselect

---

## Step 9

Developer Administration Page

Features:

* View all rooms
* View participant counts
* Delete rooms
* Password-protected admin access

---

## Step 9.1

Soft Delete

Rooms are marked:

```javascript
deleted: true
```

instead of being permanently removed.

---

## Step 9.2

Security Improvements

* Firebase Authentication
* Firestore Security Rules
* Secure Developer Access

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
