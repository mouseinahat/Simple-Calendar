# Interface Update

# Goal

Restructure the interface around the user's current primary task.

The app should not show every feature with equal weight. Each screen state should make the next useful action obvious, especially on mobile.

---

# Core Principle

Prioritize by user intent:

1. Invited user opens a room link.
2. User enters the room password.
3. User selects or creates a profile.
4. User edits availability on the calendar.

Secondary actions should move to smaller controls, collapsed areas, corners, or later parts of the page.

---

# 1. Invited Room Entry

When the URL contains `?room=...`, the first screen should focus on entering the room.

## Primary UI

Show at the top:

```txt
Room entry
Room title or Room ID
Password input
[Enter room]
```

## Secondary UI

Move below or collapse:

* Create new room
* Open via link
* Copy room link

`Open via link` is not needed in the primary area when the user already arrived through an invitation link.

## Mobile Rule

On mobile, the room password panel should appear before anything else.

---

# 2. Profile Selection

After the room password is accepted, profile selection becomes the primary task.

## Primary UI

Show profile selection at the top.

Add:

* Profile search input
* Compact profile list
* Existing profile password input

## Profile List Layout

Instead of showing a separate `Select` label for every profile, profile items can be directly clickable.

Use a two-column grid where space allows:

```txt
[민수] [지영]
[Alex] [수진]
[Chris] [Dana]
```

On very small mobile screens, fall back to one column if needed.

## Large Profile Counts

If many profiles exist:

* Show a scrollable profile list.
* Limit the visible height to around 10 profiles.
* Search filters the visible profiles.

This keeps the profile area usable without pushing the calendar too far down.

## Secondary UI

Move `Create New Profile` below profile selection.

Preferred behavior:

```txt
[+ Create new profile]
```

Clicking expands the create-profile form.

---

# 3. Profile Creation

Profile creation is important, but it is secondary to selecting an existing profile.

## Recommended Changes

* Collapse the create-profile form by default.
* Auto-select an unused profile color.
* Keep manual color selection available, but do not require users to think about color first.

## Color Behavior

When creating a profile:

1. Check colors already used in the room.
2. Pick the first unused color from a fixed palette.
3. If all palette colors are used, cycle through the palette.
4. Let the user override manually.

---

# 4. Calendar Editing

After a profile is opened, the calendar becomes the primary UI.

## Primary UI

Show prominently:

* Confirmed date banner, if one exists
* Calendar
* Best date recommendations
* Participant colors/status summary

## Current Profile Highlight

The current profile's selected dates should be visibly highlighted.

Use:

* Strong profile-color outline
* Small status badge:
  * `O` = Available
  * `?` = Maybe
  * `X` = Unavailable

Do not put all participant names inside calendar cells.

## Calendar Cell Rule

Calendar cells should remain summary-oriented:

* Date number
* Small status/profile dots
* Current profile highlight
* Score or compact availability summary only if it does not crowd the cell

Avoid long text inside date cells, especially on mobile.

---

# 5. Profile Management

Profile management is secondary during calendar editing.

Move these into a smaller profile management area:

* Change profile
* Save profile
* Set/change profile password
* Clear my dates
* Delete profile

Recommended display:

```txt
Using: 민수  [Change]
[Profile settings]
```

`Profile settings` can expand to show destructive or less frequent actions.

---

# 6. Language Selection

The current language buttons take too much visual space.

Replace them with a compact dropdown in a corner.

Example:

```txt
[Language ▾]
  Korean
  English
  Japanese
  Chinese
```

This also makes it easier to support more languages later.

---

# 7. Title and Help

The title should be shorter, especially on mobile.

## Current Problem

Long title and explanatory text compete with the calendar and room-entry actions.

## Recommended Change

Use a shorter title:

```txt
Simple Calendar
```

or:

```txt
Meeting Calendar
```

Move explanations into a help page or help modal.

## Help Button

Add a compact help button:

```txt
[?]
```

or:

```txt
[Help]
```

The help page should explain:

* How to enter a room
* How to select/create a profile
* How availability states work
* How best-date recommendations work
* How to confirm a final date

---

# 8. Mobile Layout Priority

Mobile should not be a compressed desktop layout. It should reorder by task.

## Invitation Link Mobile Order

```txt
1. Room password entry
2. Profile selection
3. Calendar
4. Best dates
5. Participant/status legend
6. Secondary actions
```

## No Room Mobile Order

```txt
1. Create room
2. Open existing link
3. Help
```

## Profile Open Mobile Order

```txt
1. Confirmed date banner
2. Calendar
3. Best dates
4. Compact profile controls
5. Secondary room/profile settings
```

---

# Implementation Order

## Phase 1 - Entry Flow

* Detect invited mode with `?room=...`.
* Move room password entry to the top.
* Hide or demote `Open via link`.
* Demote room creation and link-copy actions.

## Phase 2 - Profile Selection

* Add profile search.
* Make profile cards directly clickable.
* Show profiles in a two-column grid when possible.
* Limit profile list height to about 10 profiles with internal scrolling.
* Collapse create-profile form behind a button.

## Phase 3 - Header Cleanup

* Shorten title.
* Replace language buttons with a dropdown.
* Add a help button/page.

## Phase 4 - Calendar-Focused Editing

* Keep calendar as the main UI after profile login.
* Keep current-profile date highlights.
* Move profile management actions into a smaller settings area.

---

# Non-Goals

Do not add a date detail panel for this update.

The calendar should remain lightweight and summary-oriented. Details should continue to appear in existing recommendation/participant areas below the calendar where appropriate.

