import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
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
const db = getFirestore(app);

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const developerPasswordInput = document.getElementById("developerPasswordInput");
const loginBtn = document.getElementById("loginBtn");
const refreshBtn = document.getElementById("refreshBtn");
const roomsList = document.getElementById("roomsList");
const roomCount = document.getElementById("roomCount");
const loginStatus = document.getElementById("loginStatus");
const adminStatus = document.getElementById("adminStatus");

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
  const usersSnapshot = await getDocs(collection(db, "rooms", roomId, "users"));
  return usersSnapshot.size;
}

async function loadRooms() {
  try {
    adminStatus.textContent = "방 목록을 불러오는 중입니다...";
    roomsList.innerHTML = "";

    const roomsSnapshot = await getDocs(collection(db, "rooms"));

    if (roomsSnapshot.empty) {
      roomCount.textContent = "0 rooms";
      roomsList.innerHTML = `<div class="empty">아직 생성된 방이 없습니다.</div>`;
      adminStatus.textContent = "";
      return;
    }

    const rooms = await Promise.all(
      roomsSnapshot.docs.map(async (roomDocument) => {
        const data = roomDocument.data();
        const userCount = await getUserCount(roomDocument.id);
        return {
          id: roomDocument.id,
          title: data.title || "제목 없는 방",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          deleted: data.deleted === true,
          userCount
        };
      })
    );

    rooms.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    roomCount.textContent = `${rooms.length} rooms found`;
    rooms.forEach(renderRoomCard);
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
    <div><span>Users:</span> ${room.userCount}</div>
    <div><span>Status:</span> ${room.deleted ? "Deleted" : "Active"}</div>
  `;

  info.appendChild(title);
  info.appendChild(meta);

  const controls = document.createElement("div");
  controls.className = "actions";

  const openLink = document.createElement("a");
  openLink.className = "home-link";
  openLink.href = `./?room=${room.id}`;
  openLink.textContent = "Open";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "danger";
  deleteBtn.textContent = room.deleted ? "Already Deleted" : "Delete";
  deleteBtn.disabled = room.deleted;

  deleteBtn.addEventListener("click", async () => {
    const confirmed = window.confirm(`이 방을 삭제 처리할까요?\n\n${room.title}\n${room.id}`);
    if (!confirmed) return;

    try {
      deleteBtn.disabled = true;
      deleteBtn.textContent = "Deleting...";

      await updateDoc(doc(db, "rooms", room.id), {
        deleted: true,
        deletedAt: serverTimestamp()
      });

      adminStatus.textContent = "방이 삭제 처리되었습니다.";
      await loadRooms();
    } catch (error) {
      console.error(error);
      adminStatus.textContent = `삭제 실패: ${error.message}`;
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Delete";
    }
  });

  controls.appendChild(openLink);
  controls.appendChild(deleteBtn);

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

if (sessionStorage.getItem("simpleCalendarDeveloperUnlocked") === "true") {
  loginPanel.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  loadRooms();
}
