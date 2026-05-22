// Home page — shows category cards with candidate counts.

import {
  db, collection, getDocs,
  CATEGORIES,
} from "./firebase-config.js";

const grid = document.getElementById("categoryGrid");

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
    // We still render the categories even if counts fail.
  }
  return counts;
}

function render(counts) {
  grid.innerHTML = "";
  for (const cat of CATEGORIES) {
    const count = counts[cat.id] ?? 0;
    const a = document.createElement("a");
    a.href = `category.html?cat=${encodeURIComponent(cat.id)}`;
    a.className = "category-card";
    a.style.setProperty("--cat-color", cat.color);
    a.style.setProperty("--cat-color-soft", cat.colorSoft);
    a.innerHTML = `
      <div class="category-icon">${cat.icon}</div>
      <div class="category-body">
        <h2 class="category-name">${cat.name}</h2>
        <p class="category-count">${count} candidate${count === 1 ? "" : "s"}</p>
      </div>
      <span class="category-arrow" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </span>
    `;
    grid.appendChild(a);
  }
}

(async function init() {
  // Render immediately with 0s so HR sees the categories even on slow networks
  render(Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])));
  const counts = await loadCounts();
  render(counts);
})();
