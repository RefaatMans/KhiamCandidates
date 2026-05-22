import {
  auth, db, storage,
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where, serverTimestamp,
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
  CATEGORIES, getCategoryById,
} from "../../js/firebase-config.js";

const loginSection = document.getElementById("loginSection");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const adminEmailEl = document.getElementById("adminEmail");

const uploadForm = document.getElementById("uploadForm");
const candidateName = document.getElementById("candidateName");
const candidatePhone = document.getElementById("candidatePhone");
const candidateCategory = document.getElementById("candidateCategory");
const candidateFile = document.getElementById("candidateFile");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const progressWrap = document.getElementById("progressWrap");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const filterCategory = document.getElementById("filterCategory");
const adminCandidatesList = document.getElementById("adminCandidatesList");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editName = document.getElementById("editName");
const editPhone = document.getElementById("editPhone");
const editCategory = document.getElementById("editCategory");
const editFile = document.getElementById("editFile");
const editCurrentFile = document.getElementById("editCurrentFile");
const editProgressWrap = document.getElementById("editProgressWrap");
const editProgressFill = document.getElementById("editProgressFill");
const editProgressText = document.getElementById("editProgressText");
const editSaveBtn = document.getElementById("editSaveBtn");
const editStatus = document.getElementById("editStatus");

for (const cat of CATEGORIES) {
  candidateCategory.appendChild(new Option(`${cat.icon} ${cat.nameAr}`, cat.id));
  filterCategory.appendChild(new Option(`${cat.icon} ${cat.nameAr}`, cat.id));
  editCategory.appendChild(new Option(`${cat.icon} ${cat.nameAr}`, cat.id));
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.hidden = true;
    adminPanel.hidden = false;
    logoutBtn.hidden = false;
    adminEmailEl.textContent = user.email;
    loadAdminCandidates();
  } else {
    loginSection.hidden = false;
    adminPanel.hidden = true;
    logoutBtn.hidden = true;
    adminEmailEl.textContent = "";
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPassword.value);
    loginForm.reset();
  } catch (err) {
    loginError.textContent = friendlyAuthError(err);
    loginError.hidden = false;
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus();

  const name = candidateName.value.trim();
  const phonenb = candidatePhone.value.trim();
  const category = candidateCategory.value;
  const file = candidateFile.files[0];

  if (!name || !phonenb || !category || !file) {
    return showStatus("يرجى ملء جميع الحقول المطلوبة.", "error");
  }
  if (file.type !== "application/pdf") {
    return showStatus("يُسمح بملفات PDF فقط.", "error");
  }
  if (file.size > 10 * 1024 * 1024) {
    return showStatus("يجب أن يكون حجم الملف أقل من 10MB.", "error");
  }

  uploadBtn.disabled = true;

  try {
    const existing = await findCandidateByPhone(phonenb);
    if (existing) {
      uploadBtn.disabled = false;
      return showUploadDupNotice(existing);
    }
  } catch (err) {
    uploadBtn.disabled = false;
    return showStatus(`تعذّر التحقق من الرقم: ${err.message}`, "error");
  }

  progressWrap.hidden = false;
  setProgress(0);

  try {
    const safeName = sanitizeFileName(file.name);
    const path = `cvs/${category}/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file, { contentType: "application/pdf" });

    await new Promise((resolve, reject) => {
      task.on("state_changed",
        (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
        reject,
        resolve,
      );
    });

    const url = await getDownloadURL(task.snapshot.ref);

    await addDoc(collection(db, "candidates"), {
      name,
      phonenb,
      phonenbNormalized: normalizePhone(phonenb),
      category,
      pdfUrl: url,
      pdfPath: path,
      fileName: file.name,
      uploadedAt: serverTimestamp(),
    });

    showStatus(`تم رفع سيرة "${name}" بنجاح.`, "success");
    uploadForm.reset();
    setProgress(0);
    progressWrap.hidden = true;
    loadAdminCandidates();
  } catch (err) {
    console.error(err);
    showStatus(`فشل الرفع: ${err.message}`, "error");
    progressWrap.hidden = true;
  } finally {
    uploadBtn.disabled = false;
  }
});

filterCategory.addEventListener("change", loadAdminCandidates);

async function loadAdminCandidates() {
  adminCandidatesList.innerHTML = `<div class="loading">جارٍ التحميل...</div>`;
  try {
    const cat = filterCategory.value;
    const q = cat
      ? query(collection(db, "candidates"), where("category", "==", cat))
      : collection(db, "candidates");
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => {
      const ta = a.uploadedAt?.toMillis?.() ?? 0;
      const tb = b.uploadedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });

    if (items.length === 0) {
      adminCandidatesList.innerHTML = `<div class="empty"><p>لا توجد سير ذاتية بعد.</p></div>`;
      return;
    }

    adminCandidatesList.innerHTML = "";
    for (const c of items) {
      const row = document.createElement("div");
      row.className = "admin-candidate-row";
      const catObj = getCategoryById(c.category);
      const catLabel = catObj ? `${catObj.icon} ${catObj.nameAr}` : c.category;
      const uploaded = c.uploadedAt?.toDate?.()?.toLocaleDateString("ar-LB") ?? "—";
      const phoneLine = c.phonenb
        ? `<p class="candidate-meta candidate-phone-meta">📞 ${escapeHtml(c.phonenb)}</p>`
        : "";
      row.innerHTML = `
        <div class="candidate-info">
          <p class="candidate-name">${escapeHtml(c.name)}</p>
          ${phoneLine}
          <p class="candidate-meta">${escapeHtml(catLabel)} · ${uploaded}</p>
        </div>
        <div class="row-actions">
          <a class="btn btn-secondary" href="${c.pdfUrl}" target="_blank" rel="noopener">عرض</a>
          <button class="btn btn-secondary" data-action="edit">تعديل</button>
          <button class="btn btn-danger" data-action="delete">حذف</button>
        </div>
      `;
      row.querySelector('[data-action="edit"]').addEventListener("click", () => openEditModal(c));
      row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteCandidate(c));
      adminCandidatesList.appendChild(row);
    }
  } catch (err) {
    console.error(err);
    adminCandidatesList.innerHTML = `<div class="empty"><p>خطأ: ${escapeHtml(err.message)}</p></div>`;
  }
}

async function deleteCandidate(c) {
  if (!confirm(`هل تريد حذف "${c.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
  try {
    if (c.pdfPath) {
      try { await deleteObject(ref(storage, c.pdfPath)); } catch (e) { console.warn("Storage delete:", e); }
    }
    await deleteDoc(doc(db, "candidates", c.id));
    loadAdminCandidates();
  } catch (err) {
    alert(`فشل الحذف: ${err.message}`);
  }
}

let editingCandidate = null;

function openEditModal(c) {
  editingCandidate = c;
  editName.value = c.name || "";
  editPhone.value = c.phonenb || "";
  editCategory.value = c.category || "";
  editFile.value = "";
  editCurrentFile.textContent = c.fileName ? `الملف الحالي: ${c.fileName}` : "";
  editProgressWrap.hidden = true;
  setEditProgress(0);
  editStatus.hidden = true;
  editSaveBtn.disabled = false;
  editModal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => editName.focus(), 50);
}

function closeEditModal() {
  editModal.hidden = true;
  document.body.style.overflow = "";
  editingCandidate = null;
}

document.querySelectorAll("[data-close-edit]").forEach((el) => {
  el.addEventListener("click", closeEditModal);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !editModal.hidden) closeEditModal();
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editingCandidate) return;
  editStatus.hidden = true;

  const name = editName.value.trim();
  const phonenb = editPhone.value.trim();
  const category = editCategory.value;
  const newFile = editFile.files[0];

  if (!name || !phonenb || !category) {
    return showEditStatus("الاسم والهاتف والفئة مطلوبة.", "error");
  }
  if (newFile) {
    if (newFile.type !== "application/pdf") return showEditStatus("يُسمح بملفات PDF فقط.", "error");
    if (newFile.size > 10 * 1024 * 1024) return showEditStatus("يجب أن يكون حجم الملف أقل من 10MB.", "error");
  }

  editSaveBtn.disabled = true;

  try {
    const existing = await findCandidateByPhone(phonenb, editingCandidate.id);
    if (existing) {
      editSaveBtn.disabled = false;
      return showEditStatus(`رقم الهاتف مستخدم بالفعل من قِبل "${existing.name}". استخدم رقماً آخر.`, "error");
    }
  } catch (err) {
    editSaveBtn.disabled = false;
    return showEditStatus(`تعذّر التحقق من الرقم: ${err.message}`, "error");
  }

  try {
    const updates = { name, phonenb, phonenbNormalized: normalizePhone(phonenb), category };
    let oldPathToDelete = null;

    if (newFile) {
      editProgressWrap.hidden = false;
      setEditProgress(0);
      const safeName = sanitizeFileName(newFile.name);
      const path = `cvs/${category}/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, newFile, { contentType: "application/pdf" });
      await new Promise((resolve, reject) => {
        task.on("state_changed",
          (snap) => setEditProgress((snap.bytesTransferred / snap.totalBytes) * 100),
          reject,
          resolve,
        );
      });
      const url = await getDownloadURL(task.snapshot.ref);
      updates.pdfUrl = url;
      updates.pdfPath = path;
      updates.fileName = newFile.name;
      oldPathToDelete = editingCandidate.pdfPath;
    }

    await updateDoc(doc(db, "candidates", editingCandidate.id), updates);

    if (oldPathToDelete) {
      try { await deleteObject(ref(storage, oldPathToDelete)); } catch (e) { console.warn("Old file delete:", e); }
    }

    showEditStatus("تم حفظ التغييرات.", "success");
    setTimeout(() => {
      closeEditModal();
      loadAdminCandidates();
    }, 700);
  } catch (err) {
    console.error(err);
    showEditStatus(`فشل الحفظ: ${err.message}`, "error");
    editSaveBtn.disabled = false;
    editProgressWrap.hidden = true;
  }
});

function setEditProgress(pct) {
  const v = Math.round(pct);
  editProgressFill.style.width = `${v}%`;
  editProgressText.textContent = `${v}%`;
}
function showEditStatus(msg, kind) {
  editStatus.textContent = msg;
  editStatus.className = `status-msg ${kind}`;
  editStatus.hidden = false;
}

function setProgress(pct) {
  const v = Math.round(pct);
  progressFill.style.width = `${v}%`;
  progressText.textContent = `${v}%`;
}
function showStatus(msg, kind) {
  uploadStatus.textContent = msg;
  uploadStatus.className = `status-msg ${kind}`;
  uploadStatus.hidden = false;
}
function hideStatus() { uploadStatus.hidden = true; }

function normalizePhone(s) {
  return String(s || "").replace(/[\s\-().+]/g, "");
}

async function findCandidateByPhone(phone, excludeId) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const snap = await getDocs(collection(db, "candidates"));
  for (const d of snap.docs) {
    if (excludeId && d.id === excludeId) continue;
    const data = d.data();
    if (normalizePhone(data.phonenb) === normalized) {
      return { id: d.id, ...data };
    }
  }
  return null;
}

function showUploadDupNotice(existing) {
  const catObj = getCategoryById(existing.category);
  const catLabel = catObj ? `${catObj.icon} ${catObj.nameAr}` : existing.category;
  uploadStatus.innerHTML = `
    رقم <strong>${escapeHtml(existing.phonenb)}</strong> مستخدم بالفعل من قِبل
    <strong>${escapeHtml(existing.name)}</strong> · ${escapeHtml(catLabel)}.
    <button type="button" class="btn-link" id="editExistingBtn">تعديل سجله بدلاً من ذلك ←</button>
  `;
  uploadStatus.className = "status-msg dup";
  uploadStatus.hidden = false;
  document.getElementById("editExistingBtn").addEventListener("click", () => {
    hideStatus();
    uploadForm.reset();
    progressWrap.hidden = true;
    setProgress(0);
    openEditModal(existing);
  });
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}
function friendlyAuthError(err) {
  const code = err.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (code.includes("too-many-requests"))
    return "محاولات كثيرة. يرجى الانتظار دقيقة والمحاولة مجدداً.";
  if (code.includes("network"))
    return "خطأ في الشبكة. تحقق من اتصالك بالإنترنت.";
  return err.message || "فشل تسجيل الدخول.";
}
