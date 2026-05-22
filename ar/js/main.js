import {
  db, collection, getDocs,
  CATEGORIES,
} from "../../js/firebase-config.js";

const grid       = document.getElementById("categoryGrid");
const sidebarNav = document.getElementById("sidebarNav");
const deptBadge  = document.getElementById("deptBadge");

async function loadCounts() {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
  try {
    const snap = await getDocs(collection(db, "candidates"));
    snap.forEach((d) => {
      const cat = d.data().category;
      if (counts[cat] !== undefined) counts[cat]++;
    });
  } catch (err) {
    console.warn("Could not load candidate counts:", err);
  }
  return counts;
}

function countLabel(n) {
  if (n === 0) return "0 مرشح";
  if (n === 1) return "مرشح واحد";
  return `${n} مرشح`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function buildSidebar(counts) {
  if (!sidebarNav) return;
  const label = sidebarNav.querySelector(".sidebar-section-label");
  sidebarNav.innerHTML = "";
  if (label) sidebarNav.appendChild(label);
  for (const cat of CATEGORIES) {
    const a = document.createElement("a");
    a.href = `category.html?cat=${encodeURIComponent(cat.id)}`;
    a.className = "sidebar-link";
    a.style.setProperty("--cat-color", cat.color);
    const n = counts[cat.id] ?? 0;
    a.innerHTML = `
      <span class="dot"></span>
      <span style="flex:1">${escapeHtml(cat.nameAr)}</span>
      ${n > 0 ? `<span style="font-size:0.68rem;color:rgba(255,255,255,0.35);font-weight:600">${n}</span>` : ""}
    `;
    sidebarNav.appendChild(a);
  }
}

function render(counts) {
  grid.innerHTML = "";
  let total = 0;
  for (const cat of CATEGORIES) {
    const count = counts[cat.id] ?? 0;
    total += count;
    const a = document.createElement("a");
    a.href = `category.html?cat=${encodeURIComponent(cat.id)}`;
    a.className = "category-card";
    a.style.setProperty("--cat-color", cat.color);
    a.style.setProperty("--cat-color-soft", cat.colorSoft);
    a.innerHTML = `
      <div class="category-card-header">
        <div class="category-icon">${cat.icon}</div>
        ${count > 0 ? `<span class="count-chip">${count}</span>` : ""}
      </div>
      <div>
        <h2 class="category-name">${escapeHtml(cat.nameAr)}</h2>
        <p class="category-count">${countLabel(count)}</p>
      </div>
    `;
    grid.appendChild(a);
  }
  if (deptBadge) {
    deptBadge.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ${total > 0 ? total + " مرشح" : "10 أقسام"}
    `;
  }
}

(async function init() {
  const zeroCounts = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
  render(zeroCounts);
  buildSidebar(zeroCounts);
  const counts = await loadCounts();
  render(counts);
  buildSidebar(counts);
})();
