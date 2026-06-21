import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 1) Create a Firebase project.
// 2) Add a Web app in Firebase Console.
// 3) Replace this object with your Firebase config.
// 4) Enable Firestore Database in test mode while developing.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const monthInput = document.getElementById("monthInput");
const userNameInput = document.getElementById("userNameInput");
const userColorInput = document.getElementById("userColorInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const clearMyDatesBtn = document.getElementById("clearMyDatesBtn");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const roomLabel = document.getElementById("roomLabel");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const participantCount = document.getElementById("participantCount");
const participantList = document.getElementById("participantList");
const bestDateList = document.getElementById("bestDateList");

const params = new URLSearchParams(window.location.search);
const roomId = params.get("room") || "demo-room";
const userKey = `simple-calendar-user-id-${roomId}`;
let currentUserId = localStorage.getItem(userKey);
if (!currentUserId) {
  currentUserId = crypto.randomUUID();
  localStorage.setItem(userKey, currentUserId);
}

let currentDate = new Date();
let currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
let users = [];
let myDates = new Set();

roomLabel.textContent = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

function dateToKey(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseMonth(monthString) {
  const [year, month] = monthString.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function formatMonthTitle(monthString) {
  return parseMonth(monthString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
}

function getMyProfile() {
  return users.find((user) => user.id === currentUserId);
}

async function ensureRoomExists() {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    await setDoc(roomRef, {
      title: "Simple Calendar Room",
      createdAt: serverTimestamp()
    });
  }
}

async function saveMyProfile() {
  const name = userNameInput.value.trim();
  const color = userColorInput.value;

  if (!name) {
    alert("Please enter your name first.");
    return;
  }

  const userRef = doc(db, "rooms", roomId, "users", currentUserId);
  const existing = getMyProfile();

  await setDoc(userRef, {
    name,
    color,
    dates: existing?.dates || Array.from(myDates),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function saveMyDates() {
  const name = userNameInput.value.trim();
  if (!name) {
    alert("Please enter your name and save your profile first.");
    return;
  }

  const userRef = doc(db, "rooms", roomId, "users", currentUserId);
  await setDoc(userRef, {
    name,
    color: userColorInput.value,
    dates: Array.from(myDates).sort(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

function listenToRoomUsers() {
  const usersRef = collection(db, "rooms", roomId, "users");
  onSnapshot(usersRef, (snapshot) => {
    users = snapshot.docs.map((userDoc) => ({
      id: userDoc.id,
      ...userDoc.data()
    }));

    const me = getMyProfile();
    if (me) {
      userNameInput.value = me.name || "";
      userColorInput.value = me.color || "#4f46e5";
      myDates = new Set(me.dates || []);
    }

    renderCalendar();
    renderParticipants();
    renderBestDates();
  });
}

function getDateUsers(dateKey) {
  return users.filter((user) => Array.isArray(user.dates) && user.dates.includes(dateKey));
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  monthTitle.textContent = formatMonthTitle(currentMonth);
  monthInput.value = currentMonth;

  const firstDate = parseMonth(currentMonth);
  const year = firstDate.getFullYear();
  const monthIndex = firstDate.getMonth();
  const firstDayIndex = firstDate.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = dateToKey(year, monthIndex, day);
    const dateUsers = getDateUsers(dateKey);
    const isMine = myDates.has(dateKey);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `day-cell${isMine ? " mine" : ""}${dateUsers.length === users.length && users.length > 0 ? " best" : ""}`;
    cell.setAttribute("aria-label", `Select ${dateKey}`);

    const number = document.createElement("span");
    number.className = "date-number";
    number.textContent = day;
    cell.appendChild(number);

    if (dateUsers.length > 0) {
      const badge = document.createElement("span");
      badge.className = "count-badge";
      badge.textContent = dateUsers.length;
      cell.appendChild(badge);

      const stack = document.createElement("div");
      stack.className = "color-stack";
      dateUsers.forEach((user) => {
        const dot = document.createElement("span");
        dot.className = "color-dot";
        dot.style.backgroundColor = user.color || "#4f46e5";
        dot.title = user.name || "Unnamed user";
        stack.appendChild(dot);
      });
      cell.appendChild(stack);
    }

    cell.addEventListener("click", async () => {
      if (myDates.has(dateKey)) {
        myDates.delete(dateKey);
      } else {
        myDates.add(dateKey);
      }
      renderCalendar();
      await saveMyDates();
    });

    calendarGrid.appendChild(cell);
  }
}

function renderParticipants() {
  participantCount.textContent = `${users.length} ${users.length === 1 ? "person" : "people"}`;
  participantList.innerHTML = "";

  if (users.length === 0) {
    participantList.textContent = "No participants yet.";
    return;
  }

  users.forEach((user) => {
    const chip = document.createElement("div");
    chip.className = "participant-chip";

    const dot = document.createElement("span");
    dot.className = "color-dot";
    dot.style.backgroundColor = user.color || "#4f46e5";

    const name = document.createElement("span");
    name.textContent = user.name || "Unnamed user";

    chip.append(dot, name);
    participantList.appendChild(chip);
  });
}

function renderBestDates() {
  bestDateList.innerHTML = "";
  const firstDate = parseMonth(currentMonth);
  const year = firstDate.getFullYear();
  const monthIndex = firstDate.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const rankedDates = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = dateToKey(year, monthIndex, day);
    const dateUsers = getDateUsers(dateKey);
    if (dateUsers.length > 0) {
      rankedDates.push({ dateKey, dateUsers });
    }
  }

  rankedDates
    .sort((a, b) => b.dateUsers.length - a.dateUsers.length || a.dateKey.localeCompare(b.dateKey))
    .slice(0, 5)
    .forEach(({ dateKey, dateUsers }) => {
      const item = document.createElement("li");
      item.innerHTML = `<strong>${dateKey}</strong> <span>${dateUsers.length}/${users.length} available</span>`;
      bestDateList.appendChild(item);
    });

  if (rankedDates.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No selected dates yet.";
    bestDateList.appendChild(item);
  }
}

function moveMonth(offset) {
  const monthDate = parseMonth(currentMonth);
  monthDate.setMonth(monthDate.getMonth() + offset);
  currentMonth = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
  renderCalendar();
  renderBestDates();
}

saveProfileBtn.addEventListener("click", saveMyProfile);
clearMyDatesBtn.addEventListener("click", async () => {
  myDates = new Set();
  renderCalendar();
  await saveMyDates();
});
prevMonthBtn.addEventListener("click", () => moveMonth(-1));
nextMonthBtn.addEventListener("click", () => moveMonth(1));
monthInput.addEventListener("change", () => {
  currentMonth = monthInput.value;
  renderCalendar();
  renderBestDates();
});
copyLinkBtn.addEventListener("click", async () => {
  const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
  await navigator.clipboard.writeText(url);
  copyLinkBtn.textContent = "Copied!";
  setTimeout(() => (copyLinkBtn.textContent = "Copy Link"), 1200);
});

monthInput.value = currentMonth;
await ensureRoomExists();
listenToRoomUsers();
renderCalendar();
