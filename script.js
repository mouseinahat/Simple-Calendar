import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Replace this object with your own Firebase Web App config.
// If Step 5 already worked, copy the same firebaseConfig from your Step 5 script.js.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const userNameInput = document.getElementById("userName");
const userColorInput = document.getElementById("userColor");
const roomLinkInput = document.getElementById("roomLinkInput");
const roomPasswordInput = document.getElementById("roomPassword");
const passwordPanel = document.getElementById("passwordPanel");
const unlockRoomBtn = document.getElementById("unlockRoomBtn");
const newRoomTitleInput = document.getElementById("newRoomTitle");
const newRoomPasswordInput = document.getElementById("newRoomPassword");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const clearMyDatesBtn = document.getElementById("clearMyDatesBtn");
const statusMessage = document.getElementById("statusMessage");
const legendList = document.getElementById("legendList");
const currentRoomLabel = document.getElementById("currentRoomLabel");
const roomLink = document.getElementById("roomLink");
const createRoomBtn = document.getElementById("createRoomBtn");
const copyRoomLinkBtn = document.getElementById("copyRoomLinkBtn");
const openRoomBtn = document.getElementById("openRoomBtn");
const calendarSection = document.getElementById("calendarSection");
const legendSection = document.getElementById("legendSection");
const recommendationSection = document.getElementById("recommendationSection");
const bestDatesList = document.getElementById("bestDatesList");
const userControls = document.getElementById("userControls");
const lockedNotice = document.getElementById("lockedNotice");

const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let users = [];
let unsubscribeRoom = null;
let isRoomUnlocked = false;
let currentRoomData = null;

const urlParams = new URLSearchParams(window.location.search);
const roomFromUrl = sanitizeRoomId(urlParams.get("room")) || "";

let myProfile = JSON.parse(localStorage.getItem("simpleCalendarProfile")) || {
  id: crypto.randomUUID(),
  name: "",
  color: "#4f46e5"
};

let currentRoomId = roomFromUrl;

function showError(action, error) {
  console.error(action, error);
  const message = error?.message || String(error || "Unknown error");
  statusMessage.textContent = `${action} failed: ${message}`;
}

userNameInput.value = myProfile.name || "";
userColorInput.value = myProfile.color || "#4f46e5";

function pad(number) {
  return String(number).padStart(2, "0");
}

function sanitizeRoomId(value) {
  if (!value) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function createRandomRoomId(title = "") {
  // Room IDs are independent from the room title, so duplicate titles never collide.
  // crypto.randomUUID() creates a practically unguessable ID for shared links.
  return crypto.randomUUID();
}

function extractRoomIdFromLink(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const parsedUrl = new URL(raw);
    return sanitizeRoomId(parsedUrl.searchParams.get("room"));
  } catch {
    // If a user pastes only the UUID by mistake, still support it.
    return sanitizeRoomId(raw);
  }
}

function getDateKey(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function getRoomDocRef(roomId = currentRoomId) {
  return doc(db, "rooms", roomId);
}

function getUserDocRef() {
  return doc(db, "rooms", currentRoomId, "users", myProfile.id);
}

function getUsersCollectionRef() {
  return collection(db, "rooms", currentRoomId, "users");
}

function getRoomUrl(roomId = currentRoomId) {
  const url = new URL(window.location.href);
  url.searchParams.set("room", roomId);
  return url.toString();
}

function updateRoomDisplay() {
  const title = currentRoomData?.title ? ` — ${currentRoomData.title}` : "";
  currentRoomLabel.textContent = `${currentRoomId}${title}`;
    roomLink.textContent = getRoomUrl(currentRoomId);
}

function setLockedUI(message = "Enter the correct room password to view and edit this calendar.") {
  isRoomUnlocked = false;
  users = [];
  currentRoomData = null;
  if (unsubscribeRoom) unsubscribeRoom();
  unsubscribeRoom = null;

  calendarSection.classList.add("hidden");
  legendSection.classList.add("hidden");
  recommendationSection.classList.add("hidden");
  userControls.classList.add("hidden");
  if (currentRoomId) {
    passwordPanel.classList.remove("hidden");
  } else {
    passwordPanel.classList.add("hidden");
  }
  lockedNotice.classList.remove("hidden");
  lockedNotice.textContent = message;
  statusMessage.textContent = message;
  renderCalendar();
  renderLegend();
}

function setUnlockedUI() {
  isRoomUnlocked = true;
  calendarSection.classList.remove("hidden");
  legendSection.classList.remove("hidden");
  recommendationSection.classList.remove("hidden");
  userControls.classList.remove("hidden");
  passwordPanel.classList.add("hidden");
  lockedNotice.classList.add("hidden");
}

function saveProfileLocally() {
  myProfile.name = userNameInput.value.trim();
  myProfile.color = userColorInput.value;
  localStorage.setItem("simpleCalendarProfile", JSON.stringify(myProfile));
}

async function saveProfileToFirestore(extraDates = null) {
  try {
  if (!isRoomUnlocked) {
    statusMessage.textContent = "Unlock the room before saving.";
    return;
  }

  saveProfileLocally();

  if (!myProfile.name) {
    statusMessage.textContent = "Please enter your name first.";
    return;
  }

  const currentUser = users.find((user) => user.id === myProfile.id);
  const existingDates = currentUser?.dates || [];

  await setDoc(
    getUserDocRef(),
    {
      id: myProfile.id,
      name: myProfile.name,
      color: myProfile.color,
      dates: extraDates || existingDates,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  statusMessage.textContent = "Saved.";
  } catch (error) {
    showError("Save profile", error);
  }
}

async function createRoom() {
  try {
    const password = newRoomPasswordInput.value.trim();
    const title = newRoomTitleInput.value.trim() || "Untitled Room";

    if (!password) {
      statusMessage.textContent = "Please set a room password.";
      newRoomPasswordInput.focus();
      return;
    }

    createRoomBtn.disabled = true;
    createRoomBtn.textContent = "Creating...";
    statusMessage.textContent = "Creating room...";

    const newRoomId = createRandomRoomId(title);
    currentRoomId = newRoomId;
    currentRoomData = {
      id: newRoomId,
      title,
      password
    };

    await setDoc(getRoomDocRef(newRoomId), {
      id: newRoomId,
      title,
      password,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    roomPasswordInput.value = password;
    newRoomPasswordInput.value = "";
    newRoomTitleInput.value = "";
    await unlockRoom(newRoomId, password, true);
    statusMessage.textContent = "New password-protected room created. Share the room link and password.";
  } catch (error) {
    showError("Create room", error);
  } finally {
    createRoomBtn.disabled = false;
    createRoomBtn.textContent = "Create New Room";
  }
}

async function unlockRoom(roomId, password, updateUrl = true) {
  try {
    const cleanedRoomId = sanitizeRoomId(roomId);
    const enteredPassword = String(password || "").trim();

    if (!cleanedRoomId) {
      statusMessage.textContent = "Please open a valid room link first.";
      return;
    }

    currentRoomId = cleanedRoomId;
    updateRoomDisplay();

    if (updateUrl) {
      const newUrl = getRoomUrl(currentRoomId);
      window.history.pushState({}, "", newUrl);
    }

    statusMessage.textContent = "Checking room password...";
    const roomSnapshot = await getDoc(getRoomDocRef());

    if (!roomSnapshot.exists()) {
      setLockedUI("Room not found. Create a new room or check the link.");
      return;
    }

    const roomData = roomSnapshot.data();
    const actualPassword = String(roomData.password || "");

    if (!enteredPassword || enteredPassword !== actualPassword) {
      setLockedUI("Wrong password or missing password. Please try again.");
      roomPasswordInput.focus();
      return;
    }

    currentRoomData = roomData;
    setUnlockedUI();
    updateRoomDisplay();

    if (unsubscribeRoom) unsubscribeRoom();
    unsubscribeRoom = onSnapshot(getUsersCollectionRef(), (snapshot) => {
      users = snapshot.docs.map((document) => document.data());
      renderCalendar();
      renderLegend();
      renderBestDates();
    }, (error) => {
      showError("Realtime sync", error);
    });

    statusMessage.textContent = `Unlocked room: ${currentRoomId}`;
  } catch (error) {
    showError("Unlock room", error);
  }
}


function getAvailabilityByDate() {
  const availability = {};

  users.forEach((user) => {
    (user.dates || []).forEach((date) => {
      if (!availability[date]) {
        availability[date] = [];
      }
      availability[date].push({
        id: user.id,
        name: user.name || "Unnamed",
        color: user.color || "#64748b"
      });
    });
  });

  return availability;
}

function formatDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  });
}

function renderBestDates() {
  bestDatesList.innerHTML = "";

  if (!isRoomUnlocked) {
    return;
  }

  const availability = getAvailabilityByDate();
  const rankedDates = Object.entries(availability)
    .filter(([dateKey]) => {
      const [year, month] = dateKey.split("-").map(Number);
      return year === currentYear && month === currentMonth + 1;
    })
    .map(([dateKey, people]) => ({ dateKey, people }))
    .sort((a, b) => {
      if (b.people.length !== a.people.length) {
        return b.people.length - a.people.length;
      }
      return a.dateKey.localeCompare(b.dateKey);
    })
    .slice(0, 10);

  if (rankedDates.length === 0) {
    bestDatesList.innerHTML = `<li class="empty-recommendation">No available dates have been selected for this month yet.</li>`;
    return;
  }

  rankedDates.forEach(({ dateKey, people }) => {
    const item = document.createElement("li");
    item.className = "best-date-item";

    const header = document.createElement("div");
    header.className = "best-date-header";

    const dateLabel = document.createElement("strong");
    dateLabel.textContent = formatDateLabel(dateKey);

    const countLabel = document.createElement("span");
    countLabel.textContent = `${people.length} ${people.length === 1 ? "person" : "people"} available`;

    header.appendChild(dateLabel);
    header.appendChild(countLabel);

    const names = document.createElement("div");
    names.className = "best-date-names";

    people.forEach((person) => {
      const pill = document.createElement("span");
      pill.className = "name-pill";
      pill.style.setProperty("--pill-color", person.color);
      pill.textContent = person.name;
      names.appendChild(pill);
    });

    item.appendChild(header);
    item.appendChild(names);
    bestDatesList.appendChild(item);
  });
}

function renderLegend() {
  legendList.innerHTML = "";

  if (users.length === 0) {
    legendList.innerHTML = `<p class="status">No users in this room yet.</p>`;
    return;
  }

  users.forEach((user) => {
    const item = document.createElement("div");
    item.className = "legend-item";

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.backgroundColor = user.color;

    const name = document.createElement("span");
    name.textContent = user.name;

    item.appendChild(dot);
    item.appendChild(name);
    legendList.appendChild(item);
  });
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });
  monthLabel.textContent = monthName;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "empty-day";
    calendarGrid.appendChild(emptyCell);
  }

  const availability = getAvailabilityByDate();
  const dateCounts = Object.fromEntries(
    Object.entries(availability).map(([date, people]) => [date, people.length])
  );

  const currentMonthCounts = Object.entries(dateCounts)
    .filter(([dateKey]) => {
      const [year, month] = dateKey.split("-").map(Number);
      return year === currentYear && month === currentMonth + 1;
    })
    .map(([, count]) => count);

  const maxCount = Math.max(0, ...currentMonthCounts);

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = getDateKey(currentYear, currentMonth, day);
    const dayCell = document.createElement("button");
    dayCell.className = "calendar-day";
    dayCell.type = "button";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    const count = dateCounts[dateKey] || 0;
    if (count > 0) {
      const countBadge = document.createElement("div");
      countBadge.className = "availability-count";
      countBadge.textContent = count;
      dayCell.appendChild(countBadge);
    }

    if (count > 0 && count === maxCount) {
      dayCell.classList.add("best-day");
    }

    const dotContainer = document.createElement("div");
    dotContainer.className = "color-dots";

    users.forEach((user) => {
      if ((user.dates || []).includes(dateKey)) {
        const dot = document.createElement("span");
        dot.className = "color-dot";
        dot.title = user.name;
        dot.style.backgroundColor = user.color;
        dotContainer.appendChild(dot);

        if (user.id === myProfile.id) {
          dayCell.classList.add("mine");
          dayCell.style.setProperty("--my-color", user.color);
        }
      }
    });

    dayCell.appendChild(dotContainer);

    dayCell.addEventListener("click", async () => {
      if (!isRoomUnlocked) {
        statusMessage.textContent = "Unlock the room before selecting dates.";
        return;
      }

      saveProfileLocally();

      if (!myProfile.name) {
        statusMessage.textContent = "Enter your name before selecting dates.";
        userNameInput.focus();
        return;
      }

      const currentUser = users.find((user) => user.id === myProfile.id);
      const dates = new Set(currentUser?.dates || []);

      if (dates.has(dateKey)) {
        dates.delete(dateKey);
      } else {
        dates.add(dateKey);
      }

      await saveProfileToFirestore(Array.from(dates).sort());
    });

    calendarGrid.appendChild(dayCell);
  }
}

createRoomBtn.addEventListener("click", createRoom);

copyRoomLinkBtn.addEventListener("click", async () => {
  const link = getRoomUrl(currentRoomId);
  try {
    await navigator.clipboard.writeText(link);
    statusMessage.textContent = "Room link copied. Share the password separately.";
  } catch (error) {
    roomLink.textContent = link;
    statusMessage.textContent = "Could not auto-copy. Manually copy the room link shown above.";
  }
});

openRoomBtn.addEventListener("click", () => {
  const pastedRoomId = extractRoomIdFromLink(roomLinkInput.value);

  if (!pastedRoomId) {
    statusMessage.textContent = "Paste a valid shared room link first.";
    roomLinkInput.focus();
    return;
  }

  currentRoomId = pastedRoomId;
  currentRoomData = null;
  users = [];
  updateRoomDisplay();
  window.history.pushState({}, "", getRoomUrl(currentRoomId));
  setLockedUI("Room link opened. Enter the room password to continue.");
  roomPasswordInput.value = "";
  roomPasswordInput.focus();
});

unlockRoomBtn.addEventListener("click", async () => {
  await unlockRoom(currentRoomId, roomPasswordInput.value, true);
});

saveProfileBtn.addEventListener("click", async () => {
  await saveProfileToFirestore();
});

clearMyDatesBtn.addEventListener("click", async () => {
  if (!isRoomUnlocked) {
    statusMessage.textContent = "Unlock the room before clearing dates.";
    return;
  }

  saveProfileLocally();

  if (!myProfile.name) {
    statusMessage.textContent = "Please enter your name first.";
    return;
  }

  await setDoc(
    getUserDocRef(),
    {
      id: myProfile.id,
      name: myProfile.name,
      color: myProfile.color,
      dates: [],
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  statusMessage.textContent = "Your selected dates were cleared.";
});


roomPasswordInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    await unlockRoom(currentRoomId, roomPasswordInput.value, true);
  }
});

userColorInput.addEventListener("change", saveProfileLocally);
userNameInput.addEventListener("change", saveProfileLocally);

prevMonthBtn.addEventListener("click", () => {
  currentMonth -= 1;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear -= 1;
  }
  renderCalendar();
  renderBestDates();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth += 1;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  renderCalendar();
  renderBestDates();
});

window.addEventListener("popstate", async () => {
  const params = new URLSearchParams(window.location.search);
  const roomId = sanitizeRoomId(params.get("room")) || "";
  currentRoomId = roomId;
  updateRoomDisplay();
  setLockedUI(roomId ? "Enter the room password again to continue." : "Create a room or open a shared room link.");
});

if (currentRoomId) {
  roomLinkInput.value = getRoomUrl(currentRoomId);
}
updateRoomDisplay();
setLockedUI(currentRoomId ? "Enter the room password to open this room." : "Create a room or open a shared room link.");
renderCalendar();
renderBestDates();
