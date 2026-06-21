import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Replace this object with your own Firebase Web App config.
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
const saveProfileBtn = document.getElementById("saveProfileBtn");
const clearMyDatesBtn = document.getElementById("clearMyDatesBtn");
const statusMessage = document.getElementById("statusMessage");
const legendList = document.getElementById("legendList");

const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let users = [];
let unsubscribeRoom = null;

let myProfile = JSON.parse(localStorage.getItem("simpleCalendarProfile")) || {
  id: crypto.randomUUID(),
  name: "",
  color: "#4f46e5",
  roomId: "default-room"
};

userNameInput.value = myProfile.name || "";
userColorInput.value = myProfile.color || "#4f46e5";
roomIdInput.value = myProfile.roomId || "default-room";

function pad(number) {
  return String(number).padStart(2, "0");
}

function getDateKey(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function getUserDocRef() {
  const roomId = (roomIdInput.value || "default-room").trim();
  return doc(db, "rooms", roomId, "users", myProfile.id);
}

function getUsersCollectionRef() {
  const roomId = (roomIdInput.value || "default-room").trim();
  return collection(db, "rooms", roomId, "users");
}

function saveProfileLocally() {
  myProfile.name = userNameInput.value.trim();
  myProfile.color = userColorInput.value;
  myProfile.roomId = (roomIdInput.value || "default-room").trim();
  localStorage.setItem("simpleCalendarProfile", JSON.stringify(myProfile));
}

async function saveProfileToFirestore(extraDates = null) {
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

function listenToRoom() {
  if (unsubscribeRoom) unsubscribeRoom();

  saveProfileLocally();

  unsubscribeRoom = onSnapshot(getUsersCollectionRef(), (snapshot) => {
    users = snapshot.docs.map((document) => document.data());
    renderCalendar();
    renderLegend();
  });
}

function renderLegend() {
  legendList.innerHTML = "";

  if (users.length === 0) {
    legendList.innerHTML = `<p class="status">No users yet.</p>`;
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

saveProfileBtn.addEventListener("click", async () => {
  await saveProfileToFirestore();
  listenToRoom();
});

clearMyDatesBtn.addEventListener("click", async () => {
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

roomIdInput.addEventListener("change", listenToRoom);
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

listenToRoom();
renderCalendar();
