// =====================================================================
// Firebase configuration
// ---------------------------------------------------------------------
// Replace the values below with the firebaseConfig object you got from
// the Firebase Console (Project Settings → Your apps → Web app).
// =====================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// --- PASTE YOUR CONFIG HERE ------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCcmf8Tzo3Ylprs56rNHA4m6r72maUa0II",
  authDomain: "khiam-jobs.firebaseapp.com",
  projectId: "khiam-jobs",
  storageBucket: "khiam-jobs.firebasestorage.app",
  messagingSenderId: "955460970855",
  appId: "1:955460970855:web:187092534364dfec87a7c2",
};
// ---------------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// --- Categories ------------------------------------------------------
// Edit this list to add/remove categories.
// `id` is the value stored in Firestore (lowercase, no spaces).
export const CATEGORIES = [
  { id: "engineering", name: "Engineering", nameAr: "هندسة", icon: "⚙️", color: "#f59e0b", colorSoft: "#fef3c7", subcategories: [
    { id: "civil",       name: "Civil",       nameAr: "مدني" },
    { id: "mechanical",  name: "Mechanical",  nameAr: "ميكانيكي" },
    { id: "computer",  name: "Computer",  nameAr: "كومبيوتر" },
    { id: "electrical",  name: "Electrical",  nameAr: "كهربائي" },
    { id: "chemical",    name: "Chemical",    nameAr: "كيميائي" },
    { id: "industrial",  name: "Industrial",  nameAr: "صناعي" },
  ]},
  { id: "computer-science", name: "Computer Science", nameAr: "علوم الحاسوب", icon: "💻", color: "#6366f1", colorSoft: "#e0e7ff", subcategories: [
    { id: "software-dev",   name: "Software Development", nameAr: "تطوير البرمجيات" },
    { id: "web-dev",        name: "Web Development",      nameAr: "تطوير الويب" },
    { id: "data-science",   name: "Data Science",         nameAr: "علم البيانات" },
    { id: "cybersecurity",  name: "Cybersecurity",        nameAr: "أمن المعلومات" },
    { id: "networking",     name: "Networking",           nameAr: "شبكات" },
  ]},
  { id: "pharma", name: "Pharma", nameAr: "صيدلة", icon: "💊", color: "#10b981", colorSoft: "#d1fae5", subcategories: [
    { id: "clinical",    name: "Clinical Pharmacy",    nameAr: "صيدلة سريرية" },
    { id: "industrial",  name: "Industrial Pharmacy",  nameAr: "صيدلة صناعية" },
    { id: "community",   name: "Community Pharmacy",   nameAr: "صيدلة مجتمعية" },
    { id: "hospital",    name: "Hospital Pharmacy",    nameAr: "صيدلة مستشفى" },
  ]},
  { id: "business", name: "Business", nameAr: "أعمال", icon: "📊", color: "#8b5cf6", colorSoft: "#ede9fe", subcategories: [
    { id: "management",   name: "Management",     nameAr: "إدارة" },
    { id: "hr",           name: "Human Resources", nameAr: "موارد بشرية" },
    { id: "operations",   name: "Operations",     nameAr: "عمليات" },
    { id: "supply-chain", name: "Supply Chain",   nameAr: "سلسلة التوريد" },
  ]},
  { id: "design", name: "Design", nameAr: "تصميم", icon: "🎨", color: "#ec4899", colorSoft: "#fce7f3", subcategories: [
    { id: "ui-ux",    name: "UI/UX Design",    nameAr: "تصميم واجهات" },
    { id: "product",  name: "Product Design",  nameAr: "تصميم منتجات" },
    { id: "interior", name: "Interior Design", nameAr: "تصميم داخلي" },
    { id: "fashion",  name: "Fashion Design",  nameAr: "تصميم أزياء" },
  ]},
  { id: "marketing", name: "Marketing", nameAr: "تسويق", icon: "📣", color: "#ef4444", colorSoft: "#fee2e2", subcategories: [
    { id: "digital",  name: "Digital Marketing", nameAr: "تسويق رقمي" },
    { id: "brand",    name: "Brand Management",  nameAr: "إدارة العلامة التجارية" },
    { id: "content",  name: "Content Marketing", nameAr: "تسويق بالمحتوى" },
    { id: "sales",    name: "Sales",             nameAr: "مبيعات" },
  ]},
  { id: "finance", name: "Finance", nameAr: "مالية", icon: "💰", color: "#059669", colorSoft: "#d1fae5", subcategories: [
    { id: "accounting", name: "Accounting", nameAr: "محاسبة" },
    { id: "banking",    name: "Banking",    nameAr: "مصرفية" },
    { id: "investment", name: "Investment", nameAr: "استثمار" },
    { id: "auditing",   name: "Auditing",   nameAr: "تدقيق" },
  ]},
  { id: "healthcare", name: "Healthcare", nameAr: "رعاية صحية", icon: "🩺", color: "#06b6d4", colorSoft: "#cffafe", subcategories: [
    { id: "nursing",       name: "Nursing",           nameAr: "تمريض" },
    { id: "medicine",      name: "Medicine",          nameAr: "طب" },
    { id: "physiotherapy", name: "Physical Therapy",  nameAr: "علاج طبيعي" },
    { id: "dentistry",     name: "Dentistry",         nameAr: "طب أسنان" },
    { id: "lab",           name: "Laboratory",        nameAr: "مختبر" },
    { id: "radiology",     name: "Radiology",         nameAr: "أشعة" },
  ]},
  { id: "graphic-design", name: "Graphic Design", nameAr: "تصميم جرافيك", icon: "🖌️", color: "#f97316", colorSoft: "#ffedd5", subcategories: [
    { id: "print",        name: "Print Design",    nameAr: "تصميم مطبوعات" },
    { id: "motion",       name: "Motion Graphics", nameAr: "موشن جرافيك" },
    { id: "illustration", name: "Illustration",    nameAr: "رسم توضيحي" },
    { id: "video",        name: "Video Editing",   nameAr: "مونتاج" },
    { id: "photography",  name: "Photography",     nameAr: "تصوير" },
  ]},
  { id: "education", name: "Education", nameAr: "تعليم", icon: "🎓", color: "#0ea5e9", colorSoft: "#e0f2fe", subcategories: [
    { id: "primary",         name: "Primary School",    nameAr: "تعليم ابتدائي" },
    { id: "secondary",       name: "Secondary School",  nameAr: "تعليم ثانوي" },
    { id: "university",      name: "University",        nameAr: "تعليم جامعي" },
    { id: "special-ed",      name: "Special Education", nameAr: "تربية خاصة" },
    { id: "early-childhood", name: "Early Childhood",   nameAr: "رياض الأطفال" },
  ]},
];

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id);
}

export function getSubcategoryById(catId, subId) {
  const cat = getCategoryById(catId);
  return cat?.subcategories?.find((s) => s.id === subId) ?? null;
}

// Footer year helper (used on every page)
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

export {
  app,
  db,
  storage,
  auth,
  // Firestore
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where, orderBy, serverTimestamp,
  // Storage
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
  // Auth
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
};
