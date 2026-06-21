# Simple Calendar — Procedure

## Project Goal

Build a simple shared calendar website hosted on GitHub Pages.

Users can access a calendar through a shared link and password, enter their name, choose their own color, mark their available dates for a selected month, and compare everyone’s availability to decide the best meeting date.

---

## Development Procedure

## Step 1 — Build the Basic Calendar UI

### Goal
Create a simple monthly calendar interface.

### Features
- Show the current month or selected month.
- Display dates in a clean monthly grid.
- Allow users to click dates.
- Selected dates should be visually highlighted.

### Output
A static calendar page using:
- `index.html`
- `style.css`
- `script.js`

---

## Step 2 — Add User Name and Color Selection

### Goal
Allow each user to identify themselves on the calendar.

### Features
- User enters their name.
- User chooses a color.
- Dates selected by the user appear in their chosen color.

### Output
A calendar where each user can mark dates with their own color.

---

## Step 3 — Add Temporary Local Storage

### Goal
Save selected dates locally in the browser before adding a real database.

### Features
- Save user name, color, and selected dates using `localStorage`.
- Reloading the page should preserve the user’s selected dates.

### Limitation
This version only works on the same browser. Other users cannot see the data yet.

---

## Step 4 — Connect a Shared Database

### Goal
Make the calendar collaborative so multiple users can see the same data.

### Recommended Tool
Firebase Firestore.

### Features
- Store room data in Firestore.
- Store each user’s name, color, and selected dates.
- Update the calendar when other users add or change their dates.

### Output
A shared calendar where multiple users can collaborate through the same link.

---

## Step 5 — Add Calendar Rooms

### Goal
Allow different groups to create different calendars.

### Features
- Create a new calendar room.
- Generate a unique room ID.
- Each room has its own calendar data.
- The room can be accessed through a link such as:

```txt
/simple-calendar/?room=abc123
```

### Output
Multiple independent calendar rooms.

---

## Step 6 — Add Password Protection

### Goal
Allow only people with the correct password to access a calendar room.

### Features
- Room creator sets a password.
- Visitors must enter the password before joining.
- Password check happens before showing the calendar.

### Note
For an MVP, a simple password check is acceptable. For stronger security, Firebase security rules or a backend should be added later.

---

## Step 7 — Add Best Date Recommendation

### Goal
Help users quickly find the best meeting dates.

### Features
- Count how many users are available on each date.
- Highlight dates with the highest number of available users.
- Display a ranked list of best dates.

### Example
```txt
Best dates:
1. June 13 — 5 people available
2. June 14 — 4 people available
3. June 20 — 3 people available
```

---

## Step 8 — Improve UI and Mobile Experience

### Goal
Make the app pleasant and easy to use on both desktop and mobile.

### Features
- Responsive layout.
- Clear color labels for users.
- Simple buttons.
- Easy month navigation.
- Better visual distinction between selected and unselected dates.

---

## Step 9 — Deploy to GitHub Pages

### Goal
Host the website publicly using GitHub Pages.

### Procedure
1. Create a GitHub repository named `Simple Calendar`.
2. Add the project files:
   - `index.html`
   - `style.css`
   - `script.js`
   - `Procedure.md`
3. Go to repository settings.
4. Open the Pages section.
5. Set the deployment branch to `main`.
6. Save and wait for GitHub Pages to publish the site.

---

## Suggested File Structure

```txt
Simple Calendar/
├── index.html
├── style.css
├── script.js
├── Procedure.md
└── README.md
```

---

## MVP Priority

The first working version should focus only on:

1. Monthly calendar UI.
2. User name and color.
3. Date selection.
4. Shared saving through Firebase.
5. Best date recommendation.

Other features can be added after the core version works.
