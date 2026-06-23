# Step 9.2 — Security Improvements

## Included Files

- `script.js`
- `developer.js`
- `FIRESTORE_RULES_STEP9_2.md`

## What changed

### Main calendar

`script.js` now signs users in with Firebase Anonymous Auth before Firestore reads/writes.

### Developer admin page

`developer.js` also signs in anonymously before loading rooms or soft-deleting rooms.

### Firestore Rules

A suggested MVP rule set is included in:

```txt
FIRESTORE_RULES_STEP9_2.md
```

## Required Firebase Console setup

Enable:

```txt
Authentication → Anonymous
```

Then update Firestore Rules to require:

```js
request.auth != null
```

## Important

This is an improvement, not final production security.

The developer password in `developer.js` is still frontend-visible because GitHub Pages is static hosting.
