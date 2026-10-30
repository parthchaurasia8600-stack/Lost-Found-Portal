// Theme toggle: remember the user's choice between visits.
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle?.querySelector(".theme-icon");
const themeLabel = themeToggle?.querySelector(".theme-label");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  if (themeIcon) themeIcon.textContent = isDark ? "☀" : "☾";
  if (themeLabel) themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
  if (themeToggle) {
    const action = isDark ? "Switch to light theme" : "Switch to dark theme";
    themeToggle.setAttribute("aria-label", action);
    themeToggle.setAttribute("title", action);
  }
}

let savedTheme = "light";
try { savedTheme = localStorage.getItem("rrimt-theme") || "light"; } catch (_) {}
applyTheme(savedTheme === "dark" ? "dark" : "light");
themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  try { localStorage.setItem("rrimt-theme", nextTheme); } catch (_) {}
});

const list = document.getElementById("items-list");
const form = document.getElementById("item-form");
const message = document.getElementById("form-message");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

// function niceDate(value) {
//   if (!value) return "Date not provided";
//   const date = new Date(value);
//   return Number.isNaN(date.getTime()) ? escapeHtml(value) :
//     date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
// }


function niceDate(value) {
  if (!value) return "Date not provided";

  // Convert value to string and extract YYYY-MM-DD
  const datePart = String(value).slice(0, 10);

  const parts = datePart.split("-");

  if (parts.length !== 3) {
    return escapeHtml(value);
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  // Validate date
  const date = new Date(year, month - 1, day);

  if (
    !year ||
    !month ||
    !day ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return escapeHtml(value);
  }

  // Display date without timezone shifting
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}


async function loadItems() {
  list.innerHTML = '<div class="loading">Loading items...</div>';
  const params = new URLSearchParams({
    search: searchInput.value.trim(),
    type: typeFilter.value
  });
  try {
    const response = await fetch(`/api/items?${params}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load items.");
    renderItems(data);
    updateStats(data);
  } catch (error) {
    list.innerHTML = `<div class="empty">${escapeHtml(error.message)}<br>Make sure the server and MySQL are running.</div>`;
    updateStats([]);
  }
}

function updateStats(items) {
  document.getElementById("open-count").textContent = items.filter(item => item.status === "Open").length;
  document.getElementById("lost-count").textContent = items.filter(item => item.item_type === "Lost").length;
  document.getElementById("found-count").textContent = items.filter(item => item.item_type === "Found").length;
}

function renderItems(items) {
  if (!items.length) {
    list.innerHTML = '<div class="empty">No items found.<br>Try another search or add a listing.</div>';
    return;
  }
  list.innerHTML = items.map(item => {
    const isReturned = item.status === "Returned";
    const typeClass = item.item_type === "Lost" ? "lost" : "found";
    const icon = item.item_type === "Lost" ? "⌕" : "✓";
    return `
      <article class="item-card">
        <div class="item-symbol">${icon}</div>
        <div class="item-main">
          <div class="item-top">
            <h3>${escapeHtml(item.item_name)}</h3>
            <span class="pill ${typeClass}">${escapeHtml(item.item_type)}</span>
          </div>
          <p class="item-meta">⌖ ${escapeHtml(item.location)} &nbsp; · &nbsp; ${niceDate(item.item_date)}</p>
          ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ""}
          <div class="item-bottom">
            <span class="status ${isReturned ? "returned" : ""}">${isReturned ? "✓ Returned" : "● Open"}</span>
            ${!isReturned ? `<button class="return-btn" data-return="${Number(item.id)}">Mark returned</button>` : ""}
          </div>
        </div>
      </article>`;
  }).join("");
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "";
  message.classList.remove("error");
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Submitting...";
  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not submit listing.");
    form.reset();
    message.textContent = "Listing added successfully!";
    await loadItems();
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("error");
  } finally {
    button.disabled = false;
    button.innerHTML = 'Submit listing <span>→</span>';
  }
});

list.addEventListener("click", async event => {
  const button = event.target.closest("[data-return]");
  if (!button) return;
  button.disabled = true;
  try {
    const response = await fetch(`/api/items/${button.dataset.return}/return`, { method: "PATCH" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not update status.");
    await loadItems();
  } catch (error) {
    alert(error.message);
    button.disabled = false;
  }
});

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadItems, 250);
});
typeFilter.addEventListener("change", loadItems);
loadItems();