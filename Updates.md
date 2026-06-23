# Updates.md

# Simple Calendar — Planned Updates

Current Version: v0.8.2

---

# Step 8.1 — Quick Select Toggle Improvement

## Goal

Improve the behavior of the quick-select buttons so that they can both select and deselect dates.

## Current Problem

Currently:

* Sunday button selects all Sundays.
* Monday button selects all Mondays.
* "Select All" selects all dates.

However:

* Clicking the button again does not reverse the action.
* Users cannot easily remove a previously selected weekday group.

## New Behavior

### Weekday Toggle

Buttons:

```txt
일 월 화 수 목 금 토
```

Behavior:

* First click → Select all dates matching that weekday.
* Second click → Deselect all dates matching that weekday.

### Select All Toggle

Button:

```txt
모두선택
```

Behavior:

* First click → Select all dates in the current month.
* Second click → Deselect all dates in the current month.

## Technical Logic

For each affected date:

```txt
Selected = true
↓
Toggle
↓
Selected = false
```

If every matching date is already selected:

```txt
Action = Deselect
```

Otherwise:

```txt
Action = Select
```

---

# Step 9 — Developer Administration Page

## Goal

Allow administrators to manage calendar rooms.

## New Page

```txt
/developer.html
```

---

## Developer Login

### Features

* Developer password input
* Access only after password verification

### Note

This is intended for MVP use only.

Since GitHub Pages is frontend-only:

```txt
Developer password is not secure.
```

A stronger solution will require Firebase Authentication later.

---

## Room Management

### Display

Show all rooms currently stored in Firestore.

For each room display:

* Room Title
* Room ID
* Creation Date
* Number of Users
* Delete Button

Example:

```txt
친구모임
Room ID:
45ad9524-ce23-4d1f-ac58-ba44c2573065

Created:
2026-06-23

Users:
5
```

---

# Step 9.1 — Soft Delete Rooms

## Goal

Prevent accidental permanent deletion.

## Instead of

```txt
Delete Firestore document immediately
```

## Use

```javascript
deleted: true
```

### Advantages

* Can restore rooms later
* Reduces accidental data loss
* Easier auditing

---

## User Experience

If a room has:

```javascript
deleted: true
```

Users attempting to access it will see:

```txt
이 방은 삭제되었습니다.
This room has been deleted.
```

---

# Step 9.2 — Security Improvements

## Goal

Strengthen room protection.

### Future Improvements

#### Firebase Authentication

Anonymous login:

```txt
Firebase Anonymous Auth
```

#### Firestore Security Rules

Current MVP:

```javascript
allow read, write: if true;
```

Target:

```javascript
allow read, write: if request.auth != null;
```

#### Developer Access

Replace hardcoded password with:

```txt
Firebase Authentication
```

---

# Development Order

## Phase 1

Step 8.1

Quick Select Toggle Fix

---

## Phase 2

Step 9

Developer Admin Page

---

## Phase 3

Step 9.1

Soft Delete Rooms

---

## Phase 4

Step 9.2

Security Improvements

* Firebase Auth
* Firestore Rules
* Developer Authentication

---

# Long-Term Vision

After these updates:

* Shared room calendars
* Password-protected rooms
* Best date recommendations
* Mobile-friendly UI
* Developer administration tools

The project will be ready for real-world testing with small groups and communities.
