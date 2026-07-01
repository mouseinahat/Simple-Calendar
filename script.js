import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJyC1cQZb47o2325r9A_zsea5XfBfNCTw",
  authDomain: "simple-calendar-46931.firebaseapp.com",
  projectId: "simple-calendar-46931",
  storageBucket: "simple-calendar-46931.firebasestorage.app",
  messagingSenderId: "188294863466",
  appId: "1:188294863466:web:8e1f5fa1a34fc3cf2bc813"
};

window.addEventListener("error", (event) => {
  const status = document.getElementById("statusMessage");
  if (status) status.textContent = `JavaScript error: ${event.message}`;
});

window.addEventListener("unhandledrejection", (event) => {
  const status = document.getElementById("statusMessage");
  if (status) status.textContent = `Firebase/Promise error: ${event.reason?.message || event.reason}`;
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
const updateProfilePasswordBtn = document.getElementById("updateProfilePasswordBtn");
const deleteProfileBtn = document.getElementById("deleteProfileBtn");
const profilePasswordUpdatePanel = document.getElementById("profilePasswordUpdatePanel");
const profilePasswordUpdateInput = document.getElementById("profilePasswordUpdate");
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
const langKoBtn = document.getElementById("langKoBtn");
const langEnBtn = document.getElementById("langEnBtn");
const profileAccessPanel = document.getElementById("profileAccessPanel");
const profileList = document.getElementById("profileList");
const profileLoginPanel = document.getElementById("profileLoginPanel");
const selectedProfileName = document.getElementById("selectedProfileName");
const profilePasswordInput = document.getElementById("profilePassword");
const loginProfileBtn = document.getElementById("loginProfileBtn");
const newProfileNameInput = document.getElementById("newProfileName");
const newProfilePasswordInput = document.getElementById("newProfilePassword");
const newProfileColorInput = document.getElementById("newProfileColor");
const createProfileBtn = document.getElementById("createProfileBtn");
const activeProfileName = document.getElementById("activeProfileName");
const switchProfileBtn = document.getElementById("switchProfileBtn");

const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let users = [];
let unsubscribeProfiles = null;
let unsubscribeLegacyUsers = null;
let isRoomUnlocked = false;
let currentRoomData = null;
let selectedProfile = null;
let profileLoginTarget = null;

const urlParams = new URLSearchParams(window.location.search);
const roomFromUrl = sanitizeRoomId(urlParams.get("room")) || "";
let currentRoomId = roomFromUrl;
let currentLanguage = localStorage.getItem("simpleCalendarLanguage") || "ko";
let myProfile = {
  id: "",
  name: "",
  color: "#4f46e5"
};

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
    passwordHelp: "공유받은 방 링크가 확인되었습니다. 비밀번호를 입력하면 프로필을 선택할 수 있습니다.",
    roomPasswordLabel: "방 비밀번호",
    roomPasswordPlaceholder: "비밀번호 입력",
    unlockRoomBtn: "방 열기",
    lockedDefault: "새 방을 만들거나 공유받은 링크를 열어주세요.",
    profileAccessHeading: "프로필 선택",
    profileAccessHelp: "이 방에서 사용할 프로필을 선택하거나 새로 만드세요.",
    profileLoginHeading: "프로필 비밀번호",
    profilePasswordLabel: "프로필 비밀번호",
    profilePasswordPlaceholder: "프로필 비밀번호 입력",
    loginProfileBtn: "프로필 열기",
    createProfileHeading: "새 프로필 만들기",
    newProfileNameLabel: "이름",
    newProfileNamePlaceholder: "이름 입력",
    newProfilePasswordLabel: "프로필 비밀번호",
    newProfilePasswordPlaceholder: "프로필 비밀번호 설정",
    newProfileColorLabel: "색상",
    createProfileBtn: "새 프로필 만들기",
    activeProfileEyebrow: "활성 프로필",
    noActiveProfile: "프로필 없음",
    switchProfileBtn: "프로필 변경",
    myNameLabel: "내 이름",
    userNamePlaceholder: "이름 입력",
    myColorLabel: "내 색상",
    saveProfileBtn: "프로필 저장",
    updateProfilePasswordBtn: "비밀번호 설정",
    profilePasswordUpdateLabel: "새 프로필 비밀번호",
    profilePasswordUpdatePlaceholder: "새 비밀번호 입력",
    deleteProfileBtn: "프로필 삭제",
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
    unnamed: "이름 없음",
    selectProfileButton: "선택",
    noProfiles: "아직 프로필이 없습니다. 새 프로필을 만들어 시작하세요."
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
    passwordHelp: "A shared room link was detected. Enter the password to choose a profile.",
    roomPasswordLabel: "Room password",
    roomPasswordPlaceholder: "Enter password",
    unlockRoomBtn: "Open room",
    lockedDefault: "Create a new room or open a shared room link.",
    profileAccessHeading: "Choose profile",
    profileAccessHelp: "Choose an existing room profile or create a new one.",
    profileLoginHeading: "Profile password",
    profilePasswordLabel: "Profile password",
    profilePasswordPlaceholder: "Enter profile password",
    loginProfileBtn: "Open profile",
    createProfileHeading: "Create New Profile",
    newProfileNameLabel: "Name",
    newProfileNamePlaceholder: "Enter name",
    newProfilePasswordLabel: "Profile password",
    newProfilePasswordPlaceholder: "Set profile password",
    newProfileColorLabel: "Color",
    createProfileBtn: "Create New Profile",
    activeProfileEyebrow: "Active profile",
    noActiveProfile: "No profile",
    switchProfileBtn: "Switch profile",
    myNameLabel: "My name",
    userNamePlaceholder: "Enter name",
    myColorLabel: "My color",
    saveProfileBtn: "Save profile",
    updateProfilePasswordBtn: "Set password",
    profilePasswordUpdateLabel: "New profile password",
    profilePasswordUpdatePlaceholder: "Enter new password",
    deleteProfileBtn: "Delete profile",
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
    unnamed: "Unnamed",
    selectProfileButton: "Select",
    noProfiles: "No profiles yet. Create a profile to start."
  }
};

function t(key) {
  return translations[currentLanguage]?.[key] ?? translations.ko[key] ?? key;
}

function showError(action, error) {
  console.error(action, error);
  const message = error?.message || String(error || "Unknown error");
  statusMessage.textContent = `${action} failed: ${message} | ${firebaseHelpText()}`;
}

function withTimeout(promise, label, milliseconds = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} timed out. Check Firebase API restrictions, Firestore rules, network access, or Firebase config.`));
      }, milliseconds);
    })
  ]);
}

function assertFirebaseConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value || String(value).includes("YOUR_"))
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Firebase config is missing: ${missing.join(", ")}`);
  }
}

function firebaseHelpText() {
  return currentLanguage === "ko"
    ? "Firebase 연결을 확인하세요: API 키 웹사이트 제한, Cloud Firestore API, Firestore Rules를 확인하세요."
    : "Check Firebase API key website restrictions, Cloud Firestore API, and Firestore Rules.";
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
    "passwordHelp", "roomPasswordLabel", "unlockRoomBtn", "profileAccessHeading",
    "profileAccessHelp", "profileLoginHeading", "profilePasswordLabel",
    "loginProfileBtn", "createProfileHeading", "newProfileNameLabel",
    "newProfilePasswordLabel", "newProfileColorLabel", "createProfileBtn",
    "activeProfileEyebrow", "switchProfileBtn", "myNameLabel", "myColorLabel",
    "saveProfileBtn", "updateProfilePasswordBtn", "profilePasswordUpdateLabel",
    "deleteProfileBtn", "clearMyDatesBtn",
    "recommendationHeading", "recommendationHelp", "legendHeading"
  ].forEach((id) => setText(id, t(id)));

  setPlaceholder("newRoomTitle", t("newRoomTitlePlaceholder"));
  setPlaceholder("newRoomPassword", t("newRoomPasswordPlaceholder"));
  setPlaceholder("roomPassword", t("roomPasswordPlaceholder"));
  setPlaceholder("profilePassword", t("profilePasswordPlaceholder"));
  setPlaceholder("newProfileName", t("newProfileNamePlaceholder"));
  setPlaceholder("newProfilePassword", t("newProfilePasswordPlaceholder"));
  setPlaceholder("userName", t("userNamePlaceholder"));
  setPlaceholder("profilePasswordUpdate", t("profilePasswordUpdatePlaceholder"));

  const weekdayHeaderIds = ["weekSun", "weekMon", "weekTue", "weekWed", "weekThu", "weekFri", "weekSat"];
  t("weekdaysShort").forEach((label, index) => {
    setText(weekdayHeaderIds[index], label);
  });

  updateRoomDisplay();
  updateActiveProfileDisplay();
  renderProfileList();
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

function createRandomRoomId() {
  return crypto.randomUUID();
}

function extractRoomIdFromLink(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const parsedUrl = new URL(raw);
    return sanitizeRoomId(parsedUrl.searchParams.get("room"));
  } catch {
    return sanitizeRoomId(raw);
  }
}

function getDateKey(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeProfile(documentSnapshot) {
  const data = documentSnapshot.data();
  return {
    id: data.id || documentSnapshot.id,
    name: data.name || t("unnamed"),
    color: data.color || "#64748b",
    passwordHash: data.passwordHash || "",
    availability: Array.isArray(data.availability) ? data.availability : (data.dates || [])
  };
}

function getCurrentProfileDates() {
  const currentUser = users.find((user) => user.id === myProfile.id);
  return new Set(currentUser?.availability || currentUser?.dates || []);
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

function getRoomDocRef(roomId = currentRoomId) {
  return doc(db, "rooms", roomId);
}

function getProfileDocRef(profileId = myProfile.id) {
  return doc(db, "rooms", currentRoomId, "profiles", profileId);
}

function getLegacyUserDocRef(userId = myProfile.id) {
  return doc(db, "rooms", currentRoomId, "users", userId);
}

function getProfilesCollectionRef() {
  return collection(db, "rooms", currentRoomId, "profiles");
}

function getLegacyUsersCollectionRef() {
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

  const title = currentRoomData?.title ? ` - ${currentRoomData.title}` : "";
  currentRoomLabel.textContent = `${currentRoomId}${title}`;
  roomLink.textContent = getRoomUrl(currentRoomId);
}

function updateActiveProfileDisplay() {
  activeProfileName.textContent = myProfile.name || t("noActiveProfile");
  userNameInput.value = myProfile.name || "";
  userColorInput.value = myProfile.color || "#4f46e5";
}

function stopRoomListeners() {
  if (unsubscribeProfiles) unsubscribeProfiles();
  if (unsubscribeLegacyUsers) unsubscribeLegacyUsers();
  unsubscribeProfiles = null;
  unsubscribeLegacyUsers = null;
}

function setLockedUI(message = "Open a room before editing the calendar.") {
  isRoomUnlocked = false;
  users = [];
  currentRoomData = null;
  selectedProfile = null;
  profileLoginTarget = null;
  myProfile = { id: "", name: "", color: "#4f46e5" };
  stopRoomListeners();

  calendarSection.classList.add("hidden");
  legendSection.classList.add("hidden");
  recommendationSection.classList.add("hidden");
  userControls.classList.add("hidden");
  profileAccessPanel.classList.add("hidden");
  profileLoginPanel.classList.add("hidden");
  if (currentRoomId) {
    passwordPanel.classList.remove("hidden");
  } else {
    passwordPanel.classList.add("hidden");
  }
  lockedNotice.classList.remove("hidden");
  lockedNotice.textContent = message;
  statusMessage.textContent = message;
  updateActiveProfileDisplay();
  renderCalendar();
  renderLegend();
}

function setRoomUnlockedUI() {
  isRoomUnlocked = true;
  calendarSection.classList.add("hidden");
  legendSection.classList.remove("hidden");
  recommendationSection.classList.add("hidden");
  userControls.classList.add("hidden");
  profileAccessPanel.classList.remove("hidden");
  passwordPanel.classList.add("hidden");
  lockedNotice.classList.add("hidden");
}

function setProfileUnlockedUI() {
  calendarSection.classList.remove("hidden");
  legendSection.classList.remove("hidden");
  recommendationSection.classList.remove("hidden");
  userControls.classList.remove("hidden");
  profileAccessPanel.classList.add("hidden");
  profileLoginPanel.classList.add("hidden");
  updateActiveProfileDisplay();
  renderCalendar();
  renderLegend();
  renderBestDates();
  updateQuickSelectButtonStates();
}

function renderProfileList() {
  profileList.innerHTML = "";

  if (!isRoomUnlocked) return;

  if (users.length === 0) {
    profileList.innerHTML = `<p class="status">${t("noProfiles")}</p>`;
    return;
  }

  users.forEach((profile) => {
    const item = document.createElement("button");
    item.className = "profile-list-item";
    item.type = "button";
    item.dataset.profileId = profile.id;

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.backgroundColor = profile.color;

    const name = document.createElement("strong");
    name.textContent = profile.name || t("unnamed");

    const action = document.createElement("span");
    action.textContent = t("selectProfileButton");

    item.appendChild(dot);
    item.appendChild(name);
    item.appendChild(action);
    profileList.appendChild(item);
  });
}

function chooseProfileForLogin(profileId) {
  const profile = users.find((user) => user.id === profileId);
  if (!profile) return;

  profileLoginTarget = profile;
  selectedProfileName.textContent = profile.name || t("unnamed");
  profilePasswordInput.value = "";
  profileLoginPanel.classList.remove("hidden");
  profilePasswordInput.focus();
}

async function loginSelectedProfile() {
  try {
    if (!profileLoginTarget) return;
    const password = profilePasswordInput.value.trim();
    if (!password) {
      statusMessage.textContent = currentLanguage === "ko" ? "프로필 비밀번호를 입력해주세요." : "Enter the profile password.";
      profilePasswordInput.focus();
      return;
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== profileLoginTarget.passwordHash) {
      statusMessage.textContent = currentLanguage === "ko" ? "프로필 비밀번호가 틀렸습니다." : "Profile password is incorrect.";
      profilePasswordInput.focus();
      return;
    }

    myProfile = {
      id: profileLoginTarget.id,
      name: profileLoginTarget.name,
      color: profileLoginTarget.color
    };
    selectedProfile = profileLoginTarget;
    localStorage.setItem(getRoomProfileStorageKey(), myProfile.id);
    setProfileUnlockedUI();
    statusMessage.textContent = currentLanguage === "ko" ? `${myProfile.name} 프로필로 열렸습니다.` : `Opened as ${myProfile.name}.`;
  } catch (error) {
    showError(currentLanguage === "ko" ? "프로필 열기" : "Open profile", error);
  }
}

async function createProfile() {
  try {
    if (!isRoomUnlocked) {
      statusMessage.textContent = currentLanguage === "ko" ? "프로필을 만들기 전에 방을 먼저 열어주세요." : "Open a room before creating a profile.";
      return;
    }

    const name = newProfileNameInput.value.trim();
    const password = newProfilePasswordInput.value.trim();
    const color = newProfileColorInput.value || "#4f46e5";

    if (!name) {
      statusMessage.textContent = currentLanguage === "ko" ? "프로필 이름을 입력해주세요." : "Enter a profile name.";
      newProfileNameInput.focus();
      return;
    }

    if (!password) {
      statusMessage.textContent = currentLanguage === "ko" ? "프로필 비밀번호를 설정해주세요." : "Set a profile password.";
      newProfilePasswordInput.focus();
      return;
    }

    createProfileBtn.disabled = true;
    const profileId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const profile = {
      id: profileId,
      name,
      color,
      passwordHash,
      availability: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await withTimeout(setDoc(getProfileDocRef(profileId), profile), "Create profile");
    myProfile = { id: profileId, name, color };
    selectedProfile = { id: profileId, name, color, passwordHash, availability: [] };
    localStorage.setItem(getRoomProfileStorageKey(), profileId);
    newProfileNameInput.value = "";
    newProfilePasswordInput.value = "";
    setProfileUnlockedUI();
    statusMessage.textContent = currentLanguage === "ko" ? "새 프로필이 만들어졌습니다." : "New profile created.";
  } catch (error) {
    showError(currentLanguage === "ko" ? "프로필 만들기" : "Create profile", error);
  } finally {
    createProfileBtn.disabled = false;
  }
}

function getRoomProfileStorageKey() {
  return `simpleCalendarProfile:${currentRoomId}`;
}

function saveProfileLocally() {
  myProfile.name = userNameInput.value.trim();
  myProfile.color = userColorInput.value;
}

function applyProfileOptimistically(availability) {
  const existingIndex = users.findIndex((user) => user.id === myProfile.id);
  const nextProfile = {
    id: myProfile.id,
    name: myProfile.name,
    color: myProfile.color,
    passwordHash: selectedProfile?.passwordHash || "",
    availability
  };

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...nextProfile };
  } else {
    users.push(nextProfile);
  }
}

async function saveProfileToFirestore(extraDates = null, options = {}) {
  try {
    if (!isRoomUnlocked || !myProfile.id) {
      statusMessage.textContent = currentLanguage === "ko" ? "저장하기 전에 프로필을 먼저 열어주세요." : "Open a profile before saving.";
      return;
    }

    saveProfileLocally();

    if (!myProfile.name) {
      statusMessage.textContent = currentLanguage === "ko" ? "이름을 먼저 입력해주세요." : "Enter your name first.";
      return;
    }

    const currentUser = users.find((user) => user.id === myProfile.id);
    const existingDates = currentUser?.availability || currentUser?.dates || [];
    const availability = extraDates || existingDates;

    applyProfileOptimistically(availability);
    updateActiveProfileDisplay();
    renderCalendar();
    renderLegend();
    renderBestDates();
    updateQuickSelectButtonStates();

    await setDoc(
      getProfileDocRef(),
      {
        id: myProfile.id,
        name: myProfile.name,
        color: myProfile.color,
        availability,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    if (!options.silent) {
      statusMessage.textContent = currentLanguage === "ko" ? "저장되었습니다." : "Saved.";
    }
  } catch (error) {
    showError(currentLanguage === "ko" ? "프로필 저장" : "Save profile", error);
  }
}

async function updateProfilePassword() {
  try {
    if (!isRoomUnlocked || !myProfile.id) {
      statusMessage.textContent = currentLanguage === "ko" ? "비밀번호를 설정하기 전에 프로필을 먼저 열어주세요." : "Open a profile before setting a password.";
      return;
    }

    if (profilePasswordUpdatePanel.classList.contains("hidden")) {
      profilePasswordUpdatePanel.classList.remove("hidden");
      profilePasswordUpdateInput.focus();
      return;
    }

    const password = profilePasswordUpdateInput.value.trim();
    if (!password) {
      statusMessage.textContent = currentLanguage === "ko" ? "새 프로필 비밀번호를 입력해주세요." : "Enter a new profile password.";
      profilePasswordUpdateInput.focus();
      return;
    }

    saveProfileLocally();
    const currentUser = users.find((user) => user.id === myProfile.id);
    const availability = currentUser?.availability || currentUser?.dates || [];
    const passwordHash = await hashPassword(password);

    selectedProfile = {
      ...(selectedProfile || {}),
      id: myProfile.id,
      name: myProfile.name,
      color: myProfile.color,
      passwordHash,
      availability
    };

    applyProfileOptimistically(availability);
    await withTimeout(setDoc(
      getProfileDocRef(),
      {
        id: myProfile.id,
        name: myProfile.name,
        color: myProfile.color,
        passwordHash,
        availability,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    ), "Update profile password");

    profilePasswordUpdateInput.value = "";
    profilePasswordUpdatePanel.classList.add("hidden");
    renderProfileList();
    statusMessage.textContent = currentLanguage === "ko" ? "프로필 비밀번호가 저장되었습니다." : "Profile password saved.";
  } catch (error) {
    showError(currentLanguage === "ko" ? "프로필 비밀번호 설정" : "Set profile password", error);
  }
}

async function deleteCurrentProfile() {
  try {
    if (!isRoomUnlocked || !myProfile.id) {
      statusMessage.textContent = currentLanguage === "ko" ? "삭제하기 전에 프로필을 먼저 열어주세요." : "Open a profile before deleting.";
      return;
    }

    const profileName = myProfile.name || t("unnamed");
    const confirmed = window.confirm(
      currentLanguage === "ko"
        ? `${profileName} 프로필을 삭제할까요? 이 프로필의 선택 날짜도 함께 사라집니다.`
        : `Delete the ${profileName} profile? Its selected dates will also be removed.`
    );
    if (!confirmed) return;

    const profileId = myProfile.id;
    await withTimeout(Promise.all([
      deleteDoc(getProfileDocRef(profileId)),
      deleteDoc(getLegacyUserDocRef(profileId))
    ]), "Delete profile");

    users = users.filter((user) => user.id !== profileId);
    localStorage.removeItem(getRoomProfileStorageKey());
    myProfile = { id: "", name: "", color: "#4f46e5" };
    selectedProfile = null;
    profilePasswordUpdateInput.value = "";
    profilePasswordUpdatePanel.classList.add("hidden");
    userControls.classList.add("hidden");
    calendarSection.classList.add("hidden");
    recommendationSection.classList.add("hidden");
    profileAccessPanel.classList.remove("hidden");
    renderProfileList();
    renderCalendar();
    renderLegend();
    renderBestDates();
    updateActiveProfileDisplay();
    statusMessage.textContent = currentLanguage === "ko" ? "프로필이 삭제되었습니다." : "Profile deleted.";
  } catch (error) {
    showError(currentLanguage === "ko" ? "프로필 삭제" : "Delete profile", error);
  }
}

function getQuickSelectControls() {
  return [
    monthLabel,
    ...document.querySelectorAll(".weekdays button[data-weekday]")
  ].filter(Boolean);
}

async function toggleBulkDatesInMyCalendar(targetDates, label) {
  try {
    if (!myProfile.id) {
      statusMessage.textContent = currentLanguage === "ko" ? "빠른 선택을 하기 전에 프로필을 먼저 열어주세요." : "Open a profile before using quick select.";
      return;
    }

    if (!targetDates.length) {
      statusMessage.textContent = currentLanguage === "ko" ? "현재 월에 선택할 날짜가 없습니다." : "There are no dates to select in the current month.";
      return;
    }

    const dates = getCurrentProfileDates();
    const allSelected = targetDates.every((dateKey) => dates.has(dateKey));

    targetDates.forEach((dateKey) => {
      if (allSelected) {
        dates.delete(dateKey);
      } else {
        dates.add(dateKey);
      }
    });

    const sortedDates = Array.from(dates).sort();

    applyProfileOptimistically(sortedDates);
    renderCalendar();
    renderLegend();
    renderBestDates();
    updateQuickSelectButtonStates();

    await saveProfileToFirestore(sortedDates, { silent: true });
    statusMessage.textContent = allSelected
      ? (currentLanguage === "ko" ? `${label} 날짜가 해제되었습니다.` : `${label} dates were deselected.`)
      : (currentLanguage === "ko" ? `${label} 날짜가 선택되었습니다.` : `${label} dates were selected.`);
  } catch (error) {
    showError(currentLanguage === "ko" ? "빠른 선택" : "Quick select", error);
  }
}

function updateQuickSelectButtonStates() {
  const selectedDates = getCurrentProfileDates();
  const buttons = getQuickSelectControls();

  buttons.forEach((button) => {
    let dates = [];
    if (button.dataset.selectAll === "true") {
      dates = getDatesInCurrentMonthByWeekday(null);
    } else if (button.dataset.weekday !== undefined) {
      dates = getDatesInCurrentMonthByWeekday(Number(button.dataset.weekday));
    }

    const allSelected = dates.length > 0 && dates.every((dateKey) => selectedDates.has(dateKey));
    button.classList.toggle("quick-selected", allSelected);
    button.setAttribute("aria-pressed", String(allSelected));
  });
}

async function createRoom() {
  try {
    const password = newRoomPasswordInput.value.trim();
    const title = newRoomTitleInput.value.trim() || (currentLanguage === "ko" ? "제목 없는 방" : "Untitled room");

    if (!password) {
      statusMessage.textContent = currentLanguage === "ko" ? "방 비밀번호를 설정해주세요." : "Set a room password.";
      newRoomPasswordInput.focus();
      return;
    }

    createRoomBtn.disabled = true;
    createRoomBtn.textContent = currentLanguage === "ko" ? "생성 중..." : "Creating...";
    statusMessage.textContent = currentLanguage === "ko" ? "방을 생성하는 중입니다..." : "Creating room...";

    const newRoomId = createRandomRoomId();
    currentRoomId = newRoomId;
    currentRoomData = { id: newRoomId, title, password };

    await withTimeout(setDoc(getRoomDocRef(newRoomId), {
      id: newRoomId,
      title,
      password,
      deleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), "Create room");

    roomPasswordInput.value = password;
    newRoomPasswordInput.value = "";
    newRoomTitleInput.value = "";
    await unlockRoom(newRoomId, password, true);
    statusMessage.textContent = currentLanguage === "ko"
      ? "새 방이 만들어졌습니다. 이제 이 방에서 사용할 프로필을 만드세요."
      : "Room created. Create a profile for this room.";
  } catch (error) {
    showError(currentLanguage === "ko" ? "방 만들기" : "Create room", error);
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
      statusMessage.textContent = currentLanguage === "ko" ? "올바른 방 링크를 먼저 열어주세요." : "Open a valid room link first.";
      return;
    }

    currentRoomId = cleanedRoomId;
    updateRoomDisplay();

    if (updateUrl) {
      window.history.pushState({}, "", getRoomUrl(currentRoomId));
    }

    statusMessage.textContent = currentLanguage === "ko" ? "방 비밀번호를 확인하는 중입니다..." : "Checking room password...";
    const roomSnapshot = await withTimeout(getDoc(getRoomDocRef()), "Check room password");

    if (!roomSnapshot.exists()) {
      setLockedUI(currentLanguage === "ko" ? "방을 찾을 수 없습니다. 새 방을 만들거나 링크를 확인해주세요." : "Room not found. Create a room or check the link.");
      return;
    }

    const roomData = roomSnapshot.data();
    if (roomData.deleted === true) {
      setLockedUI(currentLanguage === "ko" ? "이 방은 삭제되었습니다." : "This room has been deleted.");
      return;
    }

    const actualPassword = String(roomData.password || "");
    if (!enteredPassword || enteredPassword !== actualPassword) {
      setLockedUI(currentLanguage === "ko" ? "비밀번호가 틀렸거나 입력되지 않았습니다. 다시 시도해주세요." : "Password is missing or incorrect. Try again.");
      roomPasswordInput.focus();
      return;
    }

    currentRoomData = roomData;
    setRoomUnlockedUI();
    updateRoomDisplay();
    startRoomProfileListeners();
    statusMessage.textContent = currentLanguage === "ko" ? "방이 열렸습니다. 프로필을 선택하거나 만드세요." : "Room opened. Choose or create a profile.";
  } catch (error) {
    showError(currentLanguage === "ko" ? "방 열기" : "Open room", error);
  }
}

function startRoomProfileListeners() {
  stopRoomListeners();
  users = [];

  unsubscribeProfiles = onSnapshot(getProfilesCollectionRef(), (snapshot) => {
    const profiles = snapshot.docs.map(normalizeProfile);
    const legacyOnly = users.filter((user) => user.legacyOnly && !profiles.some((profile) => profile.id === user.id));
    users = [...profiles, ...legacyOnly].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    syncSelectedProfileFromUsers();
    renderProfileList();
    renderCalendar();
    renderLegend();
    renderBestDates();
    updateQuickSelectButtonStates();
  }, (error) => {
    showError(currentLanguage === "ko" ? "프로필 동기화" : "Profile sync", error);
  });

  unsubscribeLegacyUsers = onSnapshot(getLegacyUsersCollectionRef(), (snapshot) => {
    const existingProfileIds = new Set(users.filter((user) => !user.legacyOnly).map((user) => user.id));
    const legacyProfiles = snapshot.docs
      .map((documentSnapshot) => {
        const data = documentSnapshot.data();
        return {
          id: data.id || documentSnapshot.id,
          name: data.name || t("unnamed"),
          color: data.color || "#64748b",
          passwordHash: "",
          availability: data.dates || [],
          legacyOnly: true
        };
      })
      .filter((profile) => !existingProfileIds.has(profile.id));

    const normalProfiles = users.filter((user) => !user.legacyOnly);
    users = [...normalProfiles, ...legacyProfiles].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    renderProfileList();
    renderCalendar();
    renderLegend();
    renderBestDates();
    updateQuickSelectButtonStates();
  }, () => {
    // Older rooms without the legacy users collection can safely ignore this listener.
  });
}

function syncSelectedProfileFromUsers() {
  if (!myProfile.id) return;
  const latest = users.find((user) => user.id === myProfile.id);
  if (!latest) return;
  selectedProfile = latest;
  myProfile.name = latest.name;
  myProfile.color = latest.color;
  updateActiveProfileDisplay();
}

function getAvailabilityByDate() {
  const availability = {};

  users.forEach((user) => {
    (user.availability || user.dates || []).forEach((date) => {
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

  if (!isRoomUnlocked) return;

  const availability = getAvailabilityByDate();
  const rankedDates = Object.entries(availability)
    .filter(([dateKey]) => {
      const [year, month] = dateKey.split("-").map(Number);
      return year === currentYear && month === currentMonth + 1;
    })
    .map(([dateKey, people]) => ({ dateKey, people }))
    .sort((a, b) => {
      if (b.people.length !== a.people.length) return b.people.length - a.people.length;
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

    const weekday = new Date(currentYear, currentMonth, day).getDay();
    if (weekday === 0) dayCell.classList.add("sunday");
    if (weekday === 6) dayCell.classList.add("saturday");

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
      if ((user.availability || user.dates || []).includes(dateKey)) {
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
      if (!myProfile.id) {
        statusMessage.textContent = currentLanguage === "ko" ? "날짜를 선택하기 전에 프로필을 먼저 열어주세요." : "Open a profile before selecting dates.";
        return;
      }

      const dates = getCurrentProfileDates();
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

langKoBtn?.addEventListener("click", () => applyLanguage("ko"));
langEnBtn?.addEventListener("click", () => applyLanguage("en"));
createRoomBtn.addEventListener("click", createRoom);

copyRoomLinkBtn.addEventListener("click", async () => {
  if (!currentRoomId) {
    statusMessage.textContent = currentLanguage === "ko" ? "복사할 방 링크가 없습니다." : "No room link to copy.";
    return;
  }

  const link = getRoomUrl(currentRoomId);
  try {
    await navigator.clipboard.writeText(link);
    statusMessage.textContent = currentLanguage === "ko" ? "방 링크가 복사되었습니다. 비밀번호는 따로 공유하세요." : "Room link copied. Share the password separately.";
  } catch {
    roomLink.textContent = link;
    statusMessage.textContent = currentLanguage === "ko" ? "자동 복사에 실패했습니다. 위 링크를 직접 복사해주세요." : "Auto-copy failed. Copy the displayed link manually.";
  }
});

openRoomBtn.addEventListener("click", () => {
  const pastedRoomId = extractRoomIdFromLink(roomLinkInput.value);

  if (!pastedRoomId) {
    statusMessage.textContent = currentLanguage === "ko" ? "올바른 공유 방 링크를 먼저 붙여넣어주세요." : "Paste a valid shared room link first.";
    roomLinkInput.focus();
    return;
  }

  currentRoomId = pastedRoomId;
  currentRoomData = null;
  users = [];
  updateRoomDisplay();
  window.history.pushState({}, "", getRoomUrl(currentRoomId));
  setLockedUI(currentLanguage === "ko" ? "방 링크가 열렸습니다. 계속하려면 방 비밀번호를 입력하세요." : "Room link opened. Enter the room password to continue.");
  roomPasswordInput.value = "";
  roomPasswordInput.focus();
});

unlockRoomBtn.addEventListener("click", async () => {
  await unlockRoom(currentRoomId, roomPasswordInput.value, true);
});

profileList.addEventListener("click", (event) => {
  const item = event.target.closest(".profile-list-item");
  if (!item) return;
  const profile = users.find((user) => user.id === item.dataset.profileId);
  if (profile?.legacyOnly) {
    myProfile = { id: profile.id, name: profile.name, color: profile.color };
    selectedProfile = profile;
    setProfileUnlockedUI();
    statusMessage.textContent = currentLanguage === "ko"
      ? "이전 방식의 프로필을 열었습니다. 저장하면 새 프로필 구조로 이동됩니다."
      : "Opened a legacy profile. Saving will move it to the new profile structure.";
    return;
  }
  chooseProfileForLogin(item.dataset.profileId);
});

loginProfileBtn.addEventListener("click", loginSelectedProfile);
profilePasswordInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") await loginSelectedProfile();
});
createProfileBtn.addEventListener("click", createProfile);

switchProfileBtn.addEventListener("click", () => {
  myProfile = { id: "", name: "", color: "#4f46e5" };
  selectedProfile = null;
  profilePasswordUpdateInput.value = "";
  profilePasswordUpdatePanel.classList.add("hidden");
  userControls.classList.add("hidden");
  calendarSection.classList.add("hidden");
  recommendationSection.classList.add("hidden");
  profileAccessPanel.classList.remove("hidden");
  renderProfileList();
  updateActiveProfileDisplay();
  statusMessage.textContent = currentLanguage === "ko" ? "프로필을 선택하거나 새로 만드세요." : "Choose or create a profile.";
});

saveProfileBtn.addEventListener("click", async () => {
  await saveProfileToFirestore();
});

updateProfilePasswordBtn.addEventListener("click", updateProfilePassword);
profilePasswordUpdateInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") await updateProfilePassword();
});
deleteProfileBtn.addEventListener("click", deleteCurrentProfile);

monthLabel.addEventListener("click", async () => {
  const allDates = getDatesInCurrentMonthByWeekday(null);
  await toggleBulkDatesInMyCalendar(allDates, currentLanguage === "ko" ? "이번 달 모든" : "All this month");
});

document.querySelectorAll(".weekdays button[data-weekday]").forEach((button) => {
  button.addEventListener("click", async () => {
    const weekday = Number(button.dataset.weekday);
    const weekdayLabels = t("weekdaysLong");
    const dates = getDatesInCurrentMonthByWeekday(weekday);
    await toggleBulkDatesInMyCalendar(dates, currentLanguage === "ko" ? `이번 달 ${weekdayLabels[weekday]}` : `This month ${weekdayLabels[weekday]}`);
  });
});

clearMyDatesBtn.addEventListener("click", async () => {
  if (!myProfile.id) {
    statusMessage.textContent = currentLanguage === "ko" ? "날짜를 지우기 전에 프로필을 먼저 열어주세요." : "Open a profile before clearing dates.";
    return;
  }

  await saveProfileToFirestore([]);
  statusMessage.textContent = currentLanguage === "ko" ? "내가 선택한 날짜가 모두 지워졌습니다." : "Your selected dates were cleared.";
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

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const roomId = sanitizeRoomId(params.get("room")) || "";
  currentRoomId = roomId;
  updateRoomDisplay();
  setLockedUI(roomId
    ? (currentLanguage === "ko" ? "계속하려면 방 비밀번호를 다시 입력하세요." : "Enter the room password again to continue.")
    : t("lockedDefault"));
});

if (currentRoomId) {
  roomLinkInput.value = getRoomUrl(currentRoomId);
}

applyLanguage(currentLanguage);
updateRoomDisplay();
setLockedUI(currentRoomId
  ? (currentLanguage === "ko" ? "이 방을 열려면 방 비밀번호를 입력하세요." : "Enter the room password to open this room.")
  : t("lockedDefault"));
renderCalendar();
renderBestDates();
