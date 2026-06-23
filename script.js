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


window.addEventListener("error", (event) => {
  const status = document.getElementById("statusMessage");
  if (status) status.textContent = `JavaScript 오류: ${event.message}`;
});
window.addEventListener("unhandledrejection", (event) => {
  const status = document.getElementById("statusMessage");
  if (status) status.textContent = `Firebase/Promise 오류: ${event.reason?.message || event.reason}`;
});

assertFirebaseConfig();
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
const bulkSelectPanel = document.getElementById("bulkSelectPanel");
const langKoBtn = document.getElementById("langKoBtn");
const langEnBtn = document.getElementById("langEnBtn");

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
let currentLanguage = localStorage.getItem("simpleCalendarLanguage") || "ko";

const translations = {
  ko: {
    heroTitle: "모임 날짜를 함께 고르는 공유 달력",
    heroSubtitle: "방을 만들고 링크와 비밀번호를 공유하세요. 각자 가능한 날짜를 자기 색으로 표시하면 가장 많이 겹치는 날짜를 바로 볼 수 있습니다.",
    currentRoomEyebrow: "현재 방",
    noRoom: "방 없음",
    copyRoomLinkBtn: "방 링크 복사",
    createRoomHeading: "새 방 만들기",
    roomTitleLabel: "방 제목",
    newRoomTitlePlaceholder: "예: 7월 친구 모임",
    newRoomPasswordLabel: "방 비밀번호",
    newRoomPasswordPlaceholder: "비밀번호 설정",
    createRoomBtn: "새 방 만들기",
    openLinkHeading: "링크로 열기",
    sharedLinkLabel: "공유받은 방 링크",
    openRoomBtn: "링크 열기",
    passwordHeading: "방 비밀번호 입력",
    passwordHelp: "공유받은 방 링크가 확인되었습니다. 비밀번호를 입력하면 달력을 볼 수 있습니다.",
    roomPasswordLabel: "방 비밀번호",
    roomPasswordPlaceholder: "비밀번호 입력",
    unlockRoomBtn: "달력 열기",
    lockedDefault: "새 방을 만들거나 공유받은 링크를 열어주세요.",
    myNameLabel: "내 이름",
    userNamePlaceholder: "이름 입력",
    myColorLabel: "내 색상",
    saveProfileBtn: "프로필 저장",
    clearMyDatesBtn: "내 날짜 모두 지우기",
    bulkTitle: "이번 달 빠른 선택",
    bulkHelp: "현재 보고 있는 월에서 가능한 요일을 한 번에 선택할 수 있습니다. 선택 즉시 달력과 추천 날짜에 반영됩니다.",
    weekdaysShort: ["일", "월", "화", "수", "목", "금", "토"],
    weekdaysLong: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
    selectAllBtn: "모두선택",
    recommendationHeading: "추천 날짜",
    recommendationHelp: "가장 많은 사람이 가능한 날짜는 달력에서 노란색으로 강조됩니다.",
    legendHeading: "참여자 색상",
    peopleAvailable: "명 가능",
    emptyRecommendation: "이번 달에는 아직 선택된 가능 날짜가 없습니다.",
    noParticipants: "아직 이 방에 참여자가 없습니다.",
    unnamed: "이름 없음"
  },
  en: {
    heroTitle: "A shared calendar for choosing meeting dates",
    heroSubtitle: "Create a room, share the link and password, and let everyone mark available dates in their own color. The best overlapping dates are highlighted automatically.",
    currentRoomEyebrow: "Current Room",
    noRoom: "No room",
    copyRoomLinkBtn: "Copy room link",
    createRoomHeading: "Create New Room",
    roomTitleLabel: "Room title",
    newRoomTitlePlaceholder: "Example: July friends meetup",
    newRoomPasswordLabel: "Room password",
    newRoomPasswordPlaceholder: "Set password",
    createRoomBtn: "Create New Room",
    openLinkHeading: "Open via link",
    sharedLinkLabel: "Shared room link",
    openRoomBtn: "Open via link",
    passwordHeading: "Enter room password",
    passwordHelp: "A shared room link was detected. Enter the password to view the calendar.",
    roomPasswordLabel: "Room password",
    roomPasswordPlaceholder: "Enter password",
    unlockRoomBtn: "Open calendar",
    lockedDefault: "Create a new room or open a shared room link.",
    myNameLabel: "My name",
    userNamePlaceholder: "Enter name",
    myColorLabel: "My color",
    saveProfileBtn: "Save profile",
    clearMyDatesBtn: "Clear my dates",
    bulkTitle: "Quick select this month",
    bulkHelp: "Select all matching weekdays in the currently displayed month. Changes are reflected immediately on the calendar and recommendations.",
    weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    weekdaysLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    selectAllBtn: "Select all",
    recommendationHeading: "Best dates",
    recommendationHelp: "Dates with the most available people are highlighted in yellow on the calendar.",
    legendHeading: "User colors",
    peopleAvailable: "available",
    emptyRecommendation: "No available dates have been selected for this month yet.",
    noParticipants: "No participants in this room yet.",
    unnamed: "Unnamed"
  }
};

function showError(action, error) {
  console.error(action, error);
  const message = error?.message || String(error || "Unknown error");
  statusMessage.textContent = `${action} 실패: ${message} ${firebaseHelpText ? " | " + firebaseHelpText() : ""}`;
}

function withTimeout(promise, label, milliseconds = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} 요청 시간이 초과되었습니다. Firebase API 제한, Firestore Rules, 네트워크, 또는 Firebase 설정값을 확인해주세요.`));
      }, milliseconds);
    })
  ]);
}

function assertFirebaseConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value || String(value).includes("YOUR_"))
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Firebase 설정값이 아직 비어 있습니다: ${missing.join(", ")}`);
  }
}

function firebaseHelpText() {
  return currentLanguage === "ko"
    ? "Firebase 연결을 확인하세요: 1) Google Cloud API Key 웹사이트 제한에 https://mouseinahat.github.io/* 와 https://mouseinahat.github.io/Simple-Calendar/* 추가 2) API 제한에 Cloud Firestore API 허용 3) Firestore Rules가 개발 중 read/write 허용인지 확인"
    : "Check Firebase: 1) Add https://mouseinahat.github.io/* and https://mouseinahat.github.io/Simple-Calendar/* to API key website restrictions 2) Allow Cloud Firestore API 3) Check Firestore Rules during development.";
}

userNameInput.value = myProfile.name || "";
userColorInput.value = myProfile.color || "#4f46e5";

function t(key) {
  return translations[currentLanguage]?.[key] ?? translations.ko[key] ?? key;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setPlaceholder(id, value) {
  const element = document.getElementById(id);
  if (element) element.placeholder = value;
}

function applyLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("simpleCalendarLanguage", language);
  document.documentElement.lang = language;

  langKoBtn?.classList.toggle("active", language === "ko");
  langEnBtn?.classList.toggle("active", language === "en");

  [
    "heroTitle", "heroSubtitle", "currentRoomEyebrow", "copyRoomLinkBtn",
    "createRoomHeading", "roomTitleLabel", "newRoomPasswordLabel", "createRoomBtn",
    "openLinkHeading", "sharedLinkLabel", "openRoomBtn", "passwordHeading",
    "passwordHelp", "roomPasswordLabel", "unlockRoomBtn", "myNameLabel",
    "myColorLabel", "saveProfileBtn", "clearMyDatesBtn", "bulkTitle", "bulkHelp",
    "recommendationHeading", "recommendationHelp", "legendHeading"
  ].forEach((id) => setText(id, t(id)));

  setPlaceholder("newRoomTitle", t("newRoomTitlePlaceholder"));
  setPlaceholder("newRoomPassword", t("newRoomPasswordPlaceholder"));
  setPlaceholder("roomPassword", t("roomPasswordPlaceholder"));
  setPlaceholder("userName", t("userNamePlaceholder"));

  const weekdayButtonIds = ["weekdaySun", "weekdayMon", "weekdayTue", "weekdayWed", "weekdayThu", "weekdayFri", "weekdaySat"];
  const weekdayHeaderIds = ["weekSun", "weekMon", "weekTue", "weekWed", "weekThu", "weekFri", "weekSat"];
  t("weekdaysShort").forEach((label, index) => {
    setText(weekdayButtonIds[index], label);
    setText(weekdayHeaderIds[index], label);
  });
  setText("selectAllBtn", t("selectAllBtn"));

  updateRoomDisplay();
  renderCalendar();
  renderBestDates();
updateQuickSelectButtonStates();
  renderLegend();
}

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

function getCurrentUserDates() {
  const currentUser = users.find((user) => user.id === myProfile.id);
  return new Set(currentUser?.dates || []);
}

function getDatesInCurrentMonthByWeekday(weekday) {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dates = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    if (weekday === null || date.getDay() === weekday) {
      dates.push(getDateKey(currentYear, currentMonth, day));
    }
  }

  return dates;
}

async function toggleBulkDates(datesToToggle, label) {
  try {
    if (!isRoomUnlocked) return;

    saveProfileLocally();

    const currentDates = getCurrentUserDates();

    const allSelected =
      datesToToggle.length > 0 &&
      datesToToggle.every(date => currentDates.has(date));

    const updatedDates = new Set(currentDates);

    if (allSelected) {
      datesToToggle.forEach(date => updatedDates.delete(date));
    } else {
      datesToToggle.forEach(date => updatedDates.add(date));
    }

    const sortedDates = [...updatedDates].sort();

    const existingIndex = users.findIndex(
      user => user.id === myProfile.id
    );

    const nextUser = {
      id: myProfile.id,
      name: myProfile.name,
      color: myProfile.color,
      dates: sortedDates
    };

    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...users[existingIndex],
        ...nextUser
      };
    } else {
      users.push(nextUser);
    }

    renderCalendar();
    renderLegend();
    renderBestDates();
    updateQuickSelectButtonStates();

    await saveProfileToFirestore(sortedDates, {
      silent: true
    });

    statusMessage.textContent =
      allSelected
        ? `${label} 선택 해제`
        : `${label} 선택 완료`;

  } catch (error) {
    showError("빠른 선택", error);
  }
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
  if (!currentRoomId) {
    currentRoomLabel.textContent = t("noRoom");
    roomLink.textContent = "";
    return;
  }

  const title = currentRoomData?.title ? ` — ${currentRoomData.title}` : "";
  currentRoomLabel.textContent = `${currentRoomId}${title}`;
  roomLink.textContent = getRoomUrl(currentRoomId);
}

function setLockedUI(message = "달력을 보고 수정하려면 올바른 방 비밀번호를 입력하세요.") {
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

async function saveProfileToFirestore(extraDates = null, options = {}) {
  try {
  if (!isRoomUnlocked) {
    statusMessage.textContent = "저장하기 전에 방을 먼저 열어주세요.";
    return;
  }

  saveProfileLocally();

  if (!myProfile.name) {
    statusMessage.textContent = "이름을 먼저 입력해주세요.";
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

  if (!options.silent) {
    statusMessage.textContent = currentLanguage === "ko" ? "저장되었습니다." : "Saved.";
  }
  } catch (error) {
    showError("프로필 저장", error);
  }
}

async function createRoom() {
  try {
    const password = newRoomPasswordInput.value.trim();
    const title = newRoomTitleInput.value.trim() || "제목 없는 방";

    if (!password) {
      statusMessage.textContent = "방 비밀번호를 설정해주세요.";
      newRoomPasswordInput.focus();
      return;
    }

    createRoomBtn.disabled = true;
    createRoomBtn.textContent = currentLanguage === "ko" ? "생성 중..." : "Creating...";
    statusMessage.textContent = "방을 생성하는 중입니다...";

    const newRoomId = createRandomRoomId(title);
    currentRoomId = newRoomId;
    currentRoomData = {
      id: newRoomId,
      title,
      password
    };

    await withTimeout(setDoc(getRoomDocRef(newRoomId), {
      id: newRoomId,
      title,
      password,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), "방 생성");

    roomPasswordInput.value = password;
    newRoomPasswordInput.value = "";
    newRoomTitleInput.value = "";
    await unlockRoom(newRoomId, password, true);
    statusMessage.textContent = "비밀번호가 있는 새 방이 만들어졌습니다. 방 링크와 비밀번호를 공유하세요.";
  } catch (error) {
    showError("방 만들기", error);
  } finally {
    createRoomBtn.disabled = false;
    createRoomBtn.textContent = t("createRoomBtn");
  }
}

async function unlockRoom(roomId, password, updateUrl = true) {
  try {
    const cleanedRoomId = sanitizeRoomId(roomId);
    const enteredPassword = String(password || "").trim();

    if (!cleanedRoomId) {
      statusMessage.textContent = "올바른 방 링크를 먼저 열어주세요.";
      return;
    }

    currentRoomId = cleanedRoomId;
    updateRoomDisplay();

    if (updateUrl) {
      const newUrl = getRoomUrl(currentRoomId);
      window.history.pushState({}, "", newUrl);
    }

    statusMessage.textContent = "방 비밀번호를 확인하는 중입니다...";
    const roomSnapshot = await withTimeout(getDoc(getRoomDocRef()), "방 비밀번호 확인");

    if (!roomSnapshot.exists()) {
      setLockedUI("방을 찾을 수 없습니다. 새 방을 만들거나 링크를 확인해주세요.");
      return;
    }

    const roomData = roomSnapshot.data();
    const actualPassword = String(roomData.password || "");

    if (!enteredPassword || enteredPassword !== actualPassword) {
      setLockedUI("비밀번호가 틀렸거나 입력되지 않았습니다. 다시 시도해주세요.");
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
      updateQuickSelectButtonStates();
    }, (error) => {
      showError("실시간 동기화", error);
    });

    statusMessage.textContent = `열린 방: ${currentRoomId}`;
  } catch (error) {
    showError("방 열기", error);
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
        name: user.name || t("unnamed"),
        color: user.color || "#64748b"
      });
    });
  });

  return availability;
}

function formatDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(currentLanguage === "ko" ? "ko-KR" : "en-US", {
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
    bestDatesList.innerHTML = `<li class="empty-recommendation">${t("emptyRecommendation")}</li>`;
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
    countLabel.textContent = currentLanguage === "ko" ? `${people.length}${t("peopleAvailable")}` : `${people.length} ${t("peopleAvailable")}`;

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
    legendList.innerHTML = `<p class="status">${t("noParticipants")}</p>`;
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

  const monthName = new Date(currentYear, currentMonth).toLocaleString(currentLanguage === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long"
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
        statusMessage.textContent = "날짜를 선택하기 전에 방을 먼저 열어주세요.";
        return;
      }

      saveProfileLocally();

      if (!myProfile.name) {
        statusMessage.textContent = "날짜를 선택하기 전에 이름을 입력해주세요.";
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
      updateQuickSelectButtonStates();
    });

    calendarGrid.appendChild(dayCell);
  }
}

langKoBtn?.addEventListener("click", () => applyLanguage("ko"));
langEnBtn?.addEventListener("click", () => applyLanguage("en"));

createRoomBtn.addEventListener("click", createRoom);

copyRoomLinkBtn.addEventListener("click", async () => {
  if (!currentRoomId) {
    statusMessage.textContent = "복사할 방 링크가 없습니다. 먼저 방을 만들거나 링크를 열어주세요.";
    return;
  }

  const link = getRoomUrl(currentRoomId);
  try {
    await navigator.clipboard.writeText(link);
    statusMessage.textContent = "방 링크가 복사되었습니다. 비밀번호는 따로 공유하세요.";
  } catch (error) {
    roomLink.textContent = link;
    statusMessage.textContent = "자동 복사에 실패했습니다. 위에 표시된 방 링크를 직접 복사해주세요.";
  }
});

openRoomBtn.addEventListener("click", () => {
  const pastedRoomId = extractRoomIdFromLink(roomLinkInput.value);

  if (!pastedRoomId) {
    statusMessage.textContent = "올바른 공유 방 링크를 먼저 붙여넣어주세요.";
    roomLinkInput.focus();
    return;
  }

  currentRoomId = pastedRoomId;
  currentRoomData = null;
  users = [];
  updateRoomDisplay();
  window.history.pushState({}, "", getRoomUrl(currentRoomId));
  setLockedUI("방 링크가 열렸습니다. 계속하려면 방 비밀번호를 입력하세요.");
  roomPasswordInput.value = "";
  roomPasswordInput.focus();
});

unlockRoomBtn.addEventListener("click", async () => {
  await unlockRoom(currentRoomId, roomPasswordInput.value, true);
});

saveProfileBtn.addEventListener("click", async () => {
  await saveProfileToFirestore();
});


bulkSelectPanel.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.selectAll === "true") {
    const allDates = getDatesInCurrentMonthByWeekday(null);
    await toggleBulkDates(allDates, currentLanguage === "ko" ? "이번 달 모든" : "All this month");
    return;
  }

  if (button.dataset.weekday !== undefined) {
    const weekday = Number(button.dataset.weekday);
    const weekdayLabels = t("weekdaysLong");
    const dates = getDatesInCurrentMonthByWeekday(weekday);
    await toggleBulkDates(dates, currentLanguage === "ko" ? `이번 달 ${weekdayLabels[weekday]}` : `This month ${weekdayLabels[weekday]}`);
  }
});

clearMyDatesBtn.addEventListener("click", async () => {
  if (!isRoomUnlocked) {
    statusMessage.textContent = "날짜를 지우기 전에 방을 먼저 열어주세요.";
    return;
  }

  saveProfileLocally();

  if (!myProfile.name) {
    statusMessage.textContent = "이름을 먼저 입력해주세요.";
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

  statusMessage.textContent = "내가 선택한 날짜가 모두 지워졌습니다.";
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
  updateQuickSelectButtonStates();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth += 1;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  renderCalendar();
  renderBestDates();
  updateQuickSelectButtonStates();
});

window.addEventListener("popstate", async () => {
  const params = new URLSearchParams(window.location.search);
  const roomId = sanitizeRoomId(params.get("room")) || "";
  currentRoomId = roomId;
  updateRoomDisplay();
  setLockedUI(roomId ? "계속하려면 방 비밀번호를 다시 입력하세요." : "새 방을 만들거나 공유받은 링크를 열어주세요.");
});

if (currentRoomId) {
  roomLinkInput.value = getRoomUrl(currentRoomId);
}
applyLanguage(currentLanguage);
updateRoomDisplay();
setLockedUI(currentRoomId ? "이 방을 열려면 방 비밀번호를 입력하세요." : "새 방을 만들거나 공유받은 링크를 열어주세요.");
renderCalendar();
renderBestDates();
