# Step 9 — Developer Administration Page

This update adds a frontend-only MVP developer administration page.

## New files

- `developer.html`
- `developer.css`
- `developer.js`

## URL

After uploading the files to the GitHub repository root, visit:

```txt
https://mouseinahat.github.io/Simple-Calendar/developer.html
```

## Important setup

Open `developer.js` and change:

```js
const DEVELOPER_PASSWORD = "change-this-admin-password";
```

to your own temporary admin password.

## Features

- Developer password input
- View all Firestore rooms
- View room title
- View room ID
- View created date
- View user count
- Open room link
- Soft-delete rooms by setting `deleted: true`

## Security warning

This is MVP-only.

Because GitHub Pages is frontend-only, the developer password is visible inside public JavaScript. This is not strong security.

Future versions should use:

- Firebase Authentication
- Firestore Security Rules
- Role-based admin permissions
