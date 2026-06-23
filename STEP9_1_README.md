# Step 9.1 — Soft Delete Rooms

## Applied Change

This update prevents users from opening rooms that were soft-deleted by the Developer Administration Page.

## Main Change

In `script.js`, the `unlockRoom()` function now checks:

```js
if (roomData.deleted === true) {
  setLockedUI(
    currentLanguage === "ko"
      ? "이 방은 삭제되었습니다."
      : "This room has been deleted."
  );
  return;
}
```

## Result

If a room has:

```js
deleted: true
```

users attempting to open that room will see:

```txt
이 방은 삭제되었습니다.
This room has been deleted.
```

and the calendar will not be shown.

## Files

- `script.js` — updated main app logic
- `developer.html` — included if available
- `developer.css` — included if available
- `developer.js` — included if available
