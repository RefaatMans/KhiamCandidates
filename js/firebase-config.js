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
  { id: "engineering", name: "Engineering & IT", nameAr: "هندسة وتقنية المعلومات", icon: "⚙️", color: "#f59e0b", colorSoft: "#fef3c7", subcategories: [
    { id: "systems-admin",          name: "Systems Administrator", nameAr: "مدير أنظمة" },
    { id: "mobile-dev",             name: "Mobile App Developer",  nameAr: "مطور تطبيقات جوال" },
    { id: "it-specialist",          name: "IT Specialist",         nameAr: "متخصص تقنية المعلومات" },
    { id: "electrical-engineer",    name: "Electrical Engineer",   nameAr: "مهندس كهربائي" },
    { id: "mechanical-engineer",    name: "Mechanical Engineer",   nameAr: "مهندس ميكانيكي" },
    { id: "civil-engineer",         name: "Civil Engineer",        nameAr: "مهندس مدني" },
    { id: "industrial-engineer",    name: "Industrial Engineer",   nameAr: "مهندس صناعي" },
    { id: "mechatronics",           name: "Mechatronics Engineer", nameAr: "مهندس ميكاترونيك" },
    { id: "architecture",           name: "Architecture",          nameAr: "هندسة معمارية" },
    { id: "computer-engineer",      name: "Computer Engineer",     nameAr: "مهندس حاسوب" },
    { id: "communication-engineer", name: "Communication Engineer",nameAr: "مهندس اتصالات" },
    { id: "data-science",           name: "Data Science",          nameAr: "علم البيانات" },
  ]},
  { id: "pharma",           name: "Pharma",           nameAr: "صيدلة",          icon: "💊", color: "#10b981", colorSoft: "#d1fae5", subcategories: [] },
  { id: "business",         name: "Business",         nameAr: "أعمال",          icon: "📊", color: "#8b5cf6", colorSoft: "#ede9fe", subcategories: [] },
  { id: "design",           name: "Design",           nameAr: "تصميم",          icon: "🎨", color: "#ec4899", colorSoft: "#fce7f3", subcategories: [] },
  { id: "marketing",        name: "Marketing",        nameAr: "تسويق",          icon: "📣", color: "#ef4444", colorSoft: "#fee2e2", subcategories: [] },
  { id: "finance",          name: "Finance",          nameAr: "مالية",          icon: "💰", color: "#059669", colorSoft: "#d1fae5", subcategories: [] },
  { id: "healthcare",       name: "Healthcare",       nameAr: "رعاية صحية",     icon: "🩺", color: "#06b6d4", colorSoft: "#cffafe", subcategories: [] },
  { id: "graphic-design",   name: "Graphic Design",   nameAr: "تصميم جرافيك",  icon: "🖌️", color: "#f97316", colorSoft: "#ffedd5", subcategories: [] },
  { id: "education",        name: "Education",        nameAr: "تعليم",          icon: "🎓", color: "#0ea5e9", colorSoft: "#e0f2fe", subcategories: [] },
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
