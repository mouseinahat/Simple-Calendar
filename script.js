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
  apiKey: "AIzaSyAJyC1cQZb47o2325r9A_zsea5XfBfNCTw",
  authDomain: "simple-calendar-46931.firebaseapp.com",
  projectId: "simple-calendar-46931",
  storageBucket: "simple-calendar-46931.firebasestorage.app",
  messagingSenderId: "188294863466",
  appId: "1:188294863466:web:8e1f5fa1a34fc3cf2bc813",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const userNameInput = document.getElementById("userName");
const userColorInput = document.getElementById("userColor");
const roomIdInput = document.getElementById("roomId");
const roomPasswordInput = document.getElementById("roomPassword");
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
const roomFromUrl = sanitizeRoomId(urlParams.get("room")) || "default-room";

let myProfile = JSON.parse(localStorage.getItem("simpleCalendarProfile")) || {
  id: crypto.randomUUID(),
  name: "",
  color: "#4f46e5"
};

let currentRoomId = roomFromUrl;

userNameInput.value = myProfile.name || "";
userColorInput.value = myProfile.color || "#4f46e5";
roomIdInput.value = currentRoomId;

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

function createRandomRoomId() {
  return crypto.randomUUID();
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
  roomIdInput.value = currentRoomId;
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
  userControls.classList.add("hidden");
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
  userControls.classList.remove("hidden");
  lockedNotice.classList.add("hidden");
}

function saveProfileLocally() {
  myProfile.name = userNameInput.value.trim();
  myProfile.color = userColorInput.value;
  localStorage.setItem("simpleCalendarProfile", JSON.stringify(myProfile));
}

async function saveProfileToFirestore(extraDates = null) {
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
}

async function createRoom() {
  const password = newRoomPasswordInput.value.trim();
  const title = newRoomTitleInput.value.trim() || "Untitled Room";

  if (!password) {
    statusMessage.textContent = "Please set a room password.";
    newRoomPasswordInput.focus();
    return;
  }

  const newRoomId = createRandomRoomId();
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
}

async function unlockRoom(roomId, password, updateUrl = true) {
  const cleanedRoomId = sanitizeRoomId(roomId);
  const enteredPassword = String(password || "").trim();

  if (!cleanedRoomId) {
    statusMessage.textContent = "Please enter a room ID.";
    return;
  }

  currentRoomId = cleanedRoomId;
  updateRoomDisplay();

  if (updateUrl) {
    const newUrl = getRoomUrl(currentRoomId);
    window.history.pushState({}, "", newUrl);
  }

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
  });

  statusMessage.textContent = `Unlocked room: ${currentRoomId}`;
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

  const dateCounts = {};
  users.forEach((user) => {
    (user.dates || []).forEach((date) => {
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
  });

  const maxCount = Math.max(0, ...Object.values(dateCounts));

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
  await navigator.clipboard.writeText(link);
  statusMessage.textContent = "Room link copied. Share the password separately.";
});

openRoomBtn.addEventListener("click", async () => {
  await unlockRoom(roomIdInput.value, roomPasswordInput.value, true);
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

roomIdInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    await unlockRoom(roomIdInput.value, roomPasswordInput.value, true);
  }
});

roomPasswordInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    await unlockRoom(roomIdInput.value, roomPasswordInput.value, true);
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
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth += 1;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  renderCalendar();
});

window.addEventListener("popstate", async () => {
  const params = new URLSearchParams(window.location.search);
  const roomId = sanitizeRoomId(params.get("room")) || "default-room";
  currentRoomId = roomId;
  updateRoomDisplay();
  setLockedUI("Enter the room password again to continue.");
});

updateRoomDisplay();
setLockedUI("Enter the room password, or create a new room.");
renderCalendar();
