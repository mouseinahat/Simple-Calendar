# Step 9.2 Full Soft Delete Fixed

This ZIP includes the main calendar files, not only the developer files.

## Why this version exists

Soft delete requires two sides:

1. `developer.js`
   - Marks a room as `deleted: true`

2. `script.js`
   - Checks `roomData.deleted === true`
   - Blocks calendar access
   - Shows:
     - Korean: `이 방은 삭제되었습니다.`
     - English: `This room has been deleted.`

`index.html` does not need special UI changes, but this ZIP updates the script cache version:

```html
<script type="module" src="script.js?v=091"></script>
```

## Upload these files to GitHub root

- `index.html`
- `style.css`
- `script.js`
- `developer.html`
- `developer.css`
- `developer.js`

Then hard refresh the browser.
