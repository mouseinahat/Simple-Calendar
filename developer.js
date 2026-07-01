import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJyC1cQZb47o2325r9A_zsea5XfBfNCTw",
  authDomain: "simple-calendar-46931.firebaseapp.com",
  projectId: "simple-calendar-46931",
  storageBucket: "simple-calendar-46931.firebasestorage.app",
  messagingSenderId: "188294863466",
  appId: "1:188294863466:web:8e1f5fa1a34fc3cf2bc813",
};

// MVP-only password. Change this before uploading.
// This is not strong security because frontend code is public on GitHub Pages.
const DEVELOPER_PASSWORD = "change-this-admin-password";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let authReady = false;

async function ensureAnonymousAuth() {
  if (authReady && auth.currentUser) return auth.currentUser;

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            authReady = true;
            unsubscribe();
            resolve(user);
            return;
          }
          await signInAnonymously(auth);
        } catch (error) {
          unsubscribe();
          reject(error);
        }
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const developerPasswordInput = document.getElementById("developerPasswordInput");
const loginBtn = document.getElementById("loginBtn");
const refreshBtn = document.getElementById("refreshBtn");
const roomsList = document.getElementById("roomsList");
const roomCount = document.getElementById("roomCount");
const loginStatus = document.getElementById("loginStatus");
const adminStatus = document.getElementById("adminStatus");
const filterButtons = document.querySelectorAll(".filter-tabs button[data-filter]");

let allRooms = [];
let currentFilter = "all";

function formatDate(value) {
  if (!value) return "Unknown";

  try {
    const date = value.toDate ? value.toDate() : new Date(value);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "Unknown";
  }
}

async function getUserCount(roomId) {
  const [profilesSnapshot, usersSnapshot] = await Promise.all([
    getDocs(collection(db, "rooms", roomId, "profiles")),
    getDocs(collection(db, "rooms", roomId, "users"))
  ]);
  const participantIds = new Set([
    ...profilesSnapshot.docs.map((profile) => profile.id),
    ...usersSnapshot.docs.map((user) => user.id)
  ]);
  return participantIds.size;
}

function getVisibleRooms() {
  if (currentFilter === "active") return allRooms.filter((room) => !room.deleted);
  if (currentFilter === "deleted") return allRooms.filter((room) => room.deleted);
  return allRooms;
}

function renderRooms() {
  roomsList.innerHTML = "";
  const visibleRooms = getVisibleRooms();
  const activeCount = allRooms.filter((room) => !room.deleted).length;
  const deletedCount = allRooms.filter((room) => room.deleted).length;

  roomCount.textContent = `${visibleRooms.length} shown / ${allRooms.length} rooms (${activeCount} active, ${deletedCount} deleted)`;

  if (visibleRooms.length === 0) {
    roomsList.innerHTML = `<div class="empty">No rooms match this filter.</div>`;
    return;
  }

  visibleRooms.forEach(renderRoomCard);
}

function setRoomFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderRooms();
}

async function loadRooms() {
  try {
    await ensureAnonymousAuth();
    adminStatus.textContent = "방 목록을 불러오는 중입니다...";
    roomsList.innerHTML = "";

    const roomsSnapshot = await getDocs(collection(db, "rooms"));

    if (roomsSnapshot.empty) {
      allRooms = [];
      roomCount.textContent = "0 rooms";
      roomsList.innerHTML = `<div class="empty">아직 생성된 방이 없습니다.</div>`;
      adminStatus.textContent = "";
      return;
    }

    allRooms = await Promise.all(
      roomsSnapshot.docs.map(async (roomDocument) => {
        const data = roomDocument.data();
        const userCount = await getUserCount(roomDocument.id);
        return {
          id: roomDocument.id,
          title: data.title || "제목 없는 방",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          deleted: data.deleted === true,
          deletedAt: data.deletedAt,
          restoredAt: data.restoredAt,
          userCount
        };
      })
    );

    allRooms.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    renderRooms();
    adminStatus.textContent = "방 목록을 불러왔습니다.";
  } catch (error) {
    console.error(error);
    adminStatus.textContent = `방 목록을 불러오지 못했습니다: ${error.message}`;
  }
}

function renderRoomCard(room) {
  const card = document.createElement("article");
  card.className = room.deleted ? "room-card deleted" : "room-card";

  const top = document.createElement("div");
  top.className = "room-top";

  const info = document.createElement("div");

  const title = document.createElement("h3");
  title.className = "room-title";
  title.textContent = room.title;

  const meta = document.createElement("div");
  meta.className = "room-meta";
  meta.innerHTML = `
    <div><span>Room ID:</span> ${room.id}</div>
    <div><span>Created:</span> ${formatDate(room.createdAt)}</div>
    <div><span>Updated:</span> ${formatDate(room.updatedAt)}</div>
    <div><span>Users:</span> ${room.userCount}</div>
    <div><span>Status:</span> ${room.deleted ? "Deleted" : "Active"}</div>
    ${room.deleted ? `<div><span>Deleted:</span> ${formatDate(room.deletedAt)}</div>` : ""}
    ${room.restoredAt ? `<div><span>Restored:</span> ${formatDate(room.restoredAt)}</div>` : ""}
  `;

  info.appendChild(title);
  info.appendChild(meta);

  const controls = document.createElement("div");
  controls.className = "actions";

  const openLink = document.createElement("a");
  openLink.className = "home-link";
  openLink.href = `./?room=${room.id}`;
  openLink.textContent = "Open";

  const statusBtn = document.createElement("button");
  statusBtn.type = "button";
  statusBtn.className = room.deleted ? "restore" : "danger";
  statusBtn.textContent = room.deleted ? "Restore" : "Delete";

  statusBtn.addEventListener("click", async () => {
    const action = room.deleted ? "복구" : "삭제 처리";
    const confirmed = window.confirm(`이 방을 ${action}할까요?\n\n${room.title}\n${room.id}`);
    if (!confirmed) return;

    try {
      await ensureAnonymousAuth();
      statusBtn.disabled = true;
      statusBtn.textContent = room.deleted ? "Restoring..." : "Deleting...";

      await updateDoc(doc(db, "rooms", room.id), room.deleted
        ? {
            deleted: false,
            restoredAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
        : {
            deleted: true,
            deletedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

      adminStatus.textContent = room.deleted ? "방이 복구되었습니다." : "방이 삭제 처리되었습니다.";
      await loadRooms();
    } catch (error) {
      console.error(error);
      adminStatus.textContent = `${room.deleted ? "복구" : "삭제"} 실패: ${error.message}`;
      statusBtn.disabled = false;
      statusBtn.textContent = room.deleted ? "Restore" : "Delete";
    }
  });

  controls.appendChild(openLink);
  controls.appendChild(statusBtn);

  top.appendChild(info);
  top.appendChild(controls);
  card.appendChild(top);
  roomsList.appendChild(card);
}

function login() {
  const enteredPassword = developerPasswordInput.value.trim();

  if (!enteredPassword) {
    loginStatus.textContent = "Developer password를 입력해주세요.";
    developerPasswordInput.focus();
    return;
  }

  if (enteredPassword !== DEVELOPER_PASSWORD) {
    loginStatus.textContent = "비밀번호가 틀렸습니다.";
    developerPasswordInput.value = "";
    developerPasswordInput.focus();
    return;
  }

  sessionStorage.setItem("simpleCalendarDeveloperUnlocked", "true");
  loginPanel.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  loadRooms();
}

loginBtn.addEventListener("click", login);

developerPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") login();
});

refreshBtn.addEventListener("click", loadRooms);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setRoomFilter(button.dataset.filter));
});

if (sessionStorage.getItem("simpleCalendarDeveloperUnlocked") === "true") {
  loginPanel.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  loadRooms();
}
