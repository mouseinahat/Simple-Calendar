const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const monthPicker = document.getElementById("monthPicker");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const clearSelectionButton = document.getElementById("clearSelection");
const selectedCount = document.getElementById("selectedCount");
const selectedDatesList = document.getElementById("selectedDates");

let visibleDate = new Date();
visibleDate.setDate(1);

const selectedDates = new Set();

function formatMonthInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatDateKey(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const date = String(day).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function isToday(year, monthIndex, day) {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === monthIndex &&
    today.getDate() === day
  );
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = visibleDate.getFullYear();
  const monthIndex = visibleDate.getMonth();
  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  monthTitle.textContent = visibleDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  monthPicker.value = formatMonthInput(visibleDate);

  for (let i = 0; i < firstDayIndex; i += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day-cell empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = formatDateKey(year, monthIndex, day);
    const dayCell = document.createElement("button");
    dayCell.type = "button";
    dayCell.className = "day-cell";
    dayCell.setAttribute("aria-label", dateKey);

    if (selectedDates.has(dateKey)) {
      dayCell.classList.add("selected");
    }

    if (isToday(year, monthIndex, day)) {
      dayCell.classList.add("today");
    }

    dayCell.innerHTML = `<span class="day-number">${day}</span>`;

    dayCell.addEventListener("click", () => {
      if (selectedDates.has(dateKey)) {
        selectedDates.delete(dateKey);
      } else {
        selectedDates.add(dateKey);
      }

      renderCalendar();
      renderSelectedDates();
    });

    calendarGrid.appendChild(dayCell);
  }
}

function renderSelectedDates() {
  const dates = Array.from(selectedDates).sort();

  selectedCount.textContent = `${dates.length} date${dates.length === 1 ? "" : "s"} selected`;
  selectedDatesList.innerHTML = "";

  dates.forEach((date) => {
    const item = document.createElement("li");
    item.textContent = date;
    selectedDatesList.appendChild(item);
  });
}

function moveMonth(offset) {
  visibleDate.setMonth(visibleDate.getMonth() + offset);
  visibleDate.setDate(1);
  renderCalendar();
}

prevMonthButton.addEventListener("click", () => moveMonth(-1));
nextMonthButton.addEventListener("click", () => moveMonth(1));

monthPicker.addEventListener("change", (event) => {
  const [year, month] = event.target.value.split("-").map(Number);
  visibleDate = new Date(year, month - 1, 1);
  renderCalendar();
});

clearSelectionButton.addEventListener("click", () => {
  selectedDates.clear();
  renderCalendar();
  renderSelectedDates();
});

renderCalendar();
renderSelectedDates();
