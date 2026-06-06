import {
  db, collection, getDocs, query, where,
  CATEGORIES, getCategoryById, getSubcategoryById,
} from "../../js/firebase-config.js";

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("cat");
const category = CATEGORIES.find((c) => c.id === categoryId);

const titleEl = document.getElementById("categoryTitle");
const countEl = document.getElementById("categoryCount");
const listEl = document.getElementById("candidatesList");
const searchEl = document.getElementById("searchInput");

buildSidebar();

const enLink = document.getElementById("enLink");
if (enLink && categoryId) enLink.href = `../category.html?cat=${encodeURIComponent(categoryId)}`;

function buildSidebar() {
  const nav = document.getElementById("sidebarNav");
  if (!nav) return;
  const label = nav.querySelector(".sidebar-section-label");
  nav.innerHTML = "";
  if (label) nav.appendChild(label);
  for (const cat of CATEGORIES) {
    const a = document.createElement("a");
    a.href = `category.html?cat=${encodeURIComponent(cat.id)}`;
    a.className = "sidebar-link" + (cat.id === categoryId ? " active" : "");
    a.style.setProperty("--cat-color", cat.color);
    a.innerHTML = `<span class="dot"></span><span style="flex:1">${cat.nameAr}</span>`;
    nav.appendChild(a);
  }
}

const modal = document.getElementById("pdfModal");
const modalTitle = document.getElementById("modalTitle");
const modalIframe = document.getElementById("modalIframe");
const modalDownload = document.getElementById("modalDownload");
const modalOpen = document.getElementById("modalOpen");

let allCandidates = [];

if (!category) {
  titleEl.textContent = "الفئة غير موجودة";
  countEl.textContent = "يرجى العودة واختيار فئة صحيحة.";
  listEl.innerHTML = "";
} else {
  document.documentElement.style.setProperty("--cat-color", category.color);
  document.documentElement.style.setProperty("--cat-color-soft", category.colorSoft);
  titleEl.textContent = category.nameAr;
  countEl.textContent = "جارٍ التحميل...";
  const iconEl = document.getElementById("catTitleIcon");
  if (iconEl) {
    iconEl.textContent = category.icon;
    iconEl.style.background = category.colorSoft;
  }
  loadCandidates();
}

async function loadCandidates() {
  try {
    const q = query(collection(db, "candidates"), where("category", "==", categoryId));
    const snap = await getDocs(q);
    allCandidates = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    allCandidates.sort((a, b) => {
      const ta = a.uploadedAt?.toMillis?.() ?? 0;
      const tb = b.uploadedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    renderSubcategoryFilter(allCandidates);
    render(allCandidates);
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<div class="empty">
      <p class="empty-title">تعذّر تحميل المرشحين</p>
      <p>${err.message}</p>
    </div>`;
    countEl.textContent = "";
  }
}

function countLabel(n) {
  if (n === 0) return "0 مرشح";
  if (n === 1) return "مرشح واحد";
  return `${n} مرشح`;
}

function render(candidates) {
  const displayCount = categoryId === "workers" ? candidates.length + 19 : candidates.length;
  countEl.textContent = countLabel(displayCount);
  if (candidates.length === 0) {
    listEl.innerHTML = `<div class="empty">
      <p class="empty-title">لا يوجد مرشحون بعد</p>
      <p>ستظهر هنا السير الذاتية المرفوعة في هذه الفئة.</p>
    </div>`;
    return;
  }
  listEl.innerHTML = "";
  for (const c of candidates) {
    const initials = (c.name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    const uploaded = c.uploadedAt?.toDate?.()?.toLocaleDateString("ar-LB", { year: "numeric", month: "short", day: "numeric" }) ?? "—";
    const card = document.createElement("div");
    card.className = "candidate-card";
    const phoneLine = c.phonenb
      ? `<div class="candidate-contact">
           <a class="candidate-phone" href="tel:${escapeAttr(c.phonenb.replace(/\s+/g, ""))}" title="اتصل بـ ${escapeAttr(c.phonenb)}">
             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
             <span>${escapeHtml(c.phonenb)}</span>
           </a>
           <a class="candidate-whatsapp" href="https://wa.me/${waPhone(c.phonenb)}" target="_blank" rel="noopener" title="واتساب ${escapeAttr(c.phonenb)}">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
           </a>
         </div>`
      : "";
    const subObj = c.subcategory ? getSubcategoryById(category.id, c.subcategory) : null;
    const subBadge = subObj
      ? `<span class="subcat-badge" style="background:${category.colorSoft};color:${category.color}">${escapeHtml(subObj.nameAr)}</span>`
      : "";
    card.innerHTML = `
      <div class="candidate-top">
        <div class="candidate-avatar" style="background:linear-gradient(135deg, ${category.color}, ${category.color}cc)">${initials}</div>
        <div class="candidate-info">
          <p class="candidate-name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</p>
          ${subBadge}
          ${phoneLine}
          <p class="candidate-meta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            ${uploaded}
          </p>
        </div>
      </div>
      <div class="candidate-actions">
        <button class="btn btn-primary" data-action="preview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          معاينة
        </button>
        <a class="btn btn-secondary" href="${c.pdfUrl}" download="${escapeAttr(c.fileName || c.name + ".pdf")}" title="تحميل السيرة الذاتية">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>
        </a>
      </div>
    `;
    card.querySelector('[data-action="preview"]').addEventListener("click", () => openPreview(c));
    listEl.appendChild(card);
  }
}

let activeSubcat = "";

function renderSubcategoryFilter(candidates) {
  const container = document.getElementById("subcatFilter");
  if (!container || !category) return;
  const usedSubs = [...new Set(candidates.map((c) => c.subcategory).filter(Boolean))];
  if (usedSubs.length === 0) { container.hidden = true; return; }
  container.hidden = false;
  container.innerHTML = "";
  const all = document.createElement("button");
  all.className = "subcat-chip" + (activeSubcat === "" ? " active" : "");
  all.textContent = "الكل";
  all.addEventListener("click", () => { activeSubcat = ""; applyFilters(); renderSubcategoryFilter(allCandidates); });
  container.appendChild(all);
  for (const subId of usedSubs) {
    const subObj = getSubcategoryById(category.id, subId);
    const btn = document.createElement("button");
    btn.className = "subcat-chip" + (activeSubcat === subId ? " active" : "");
    btn.textContent = subObj ? subObj.nameAr : subId;
    btn.addEventListener("click", () => { activeSubcat = subId; applyFilters(); renderSubcategoryFilter(allCandidates); });
    container.appendChild(btn);
  }
}

function applyFilters() {
  const term = searchEl.value.trim().toLowerCase();
  let filtered = allCandidates;
  if (activeSubcat) filtered = filtered.filter((c) => c.subcategory === activeSubcat);
  if (term) filtered = filtered.filter((c) => (c.name || "").toLowerCase().includes(term));
  render(filtered);
}

searchEl.addEventListener("input", applyFilters);

function openPreview(c) {
  modalTitle.textContent = c.name;
  modalIframe.src = `${c.pdfUrl}#toolbar=1&view=FitH`;
  modalDownload.href = c.pdfUrl;
  modalDownload.setAttribute("download", c.fileName || `${c.name}.pdf`);
  modalOpen.href = c.pdfUrl;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.hidden = true;
  modalIframe.src = "about:blank";
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeModal);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}
function escapeAttr(s) { return escapeHtml(s); }

function waPhone(s) {
  let d = String(s || "").replace(/[\s\-().+]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "961" + d.slice(1);
  return d;
}
