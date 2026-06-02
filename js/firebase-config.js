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
    { id: "civil-engineer",         name: "Civil Engineer",        nameAr: "مهندس مدني" },
    { id: "mechanical-engineer",    name: "Mechanical Engineer",   nameAr: "مهندس ميكانيكي" },
    { id: "electrical-engineer",    name: "Electrical Engineer",   nameAr: "مهندس كهربائي" },
    { id: "industrial-engineer",    name: "Industrial Engineer",   nameAr: "مهندس صناعي" },
    { id: "mechatronics",           name: "Mechatronics Engineer", nameAr: "مهندس ميكاترونيك" },
    { id: "communication-engineer", name: "Communication Engineer",nameAr: "مهندس اتصالات" },
    { id: "computer-engineer",      name: "Computer Engineer",     nameAr: "مهندس حاسوب" },
    { id: "architecture",           name: "Architecture",          nameAr: "هندسة معمارية" },
    { id: "biomedical-engineer",    name: "Biomedical Engineering", nameAr: "هندسة طبية حيوية" },
  ]},
  { id: "it", name: "Information Technology", nameAr: "تقنية المعلومات", icon: "💻", color: "#3b82f6", colorSoft: "#dbeafe", subcategories: [
    { id: "computer-scientist",  name: "Computer Scientist",    nameAr: "عالم حاسوب" },
    { id: "systems-admin",       name: "Systems Administrator", nameAr: "مدير أنظمة" },
    { id: "mobile-dev",          name: "Mobile App Developer",  nameAr: "مطور تطبيقات جوال" },
    { id: "it-specialist",       name: "IT Specialist",         nameAr: "متخصص تقنية المعلومات" },
    { id: "data-science",        name: "Data Science",          nameAr: "علم البيانات" },
  ]},
  { id: "pharma",         name: "Pharma & Labs",      nameAr: "صيدلة ومختبرات", icon: "💊", color: "#10b981", colorSoft: "#d1fae5", subcategories: [] },
  { id: "business",       name: "Business & Finance", nameAr: "أعمال ومالية",   icon: "📊", color: "#8b5cf6", colorSoft: "#ede9fe", subcategories: [
    { id: "administration", name: "Administration", nameAr: "إدارة" },
    { id: "accounting",     name: "Accounting",     nameAr: "محاسبة" },
    { id: "finance",        name: "Finance",        nameAr: "مالية" },
  ]},
  { id: "marketing",      name: "Marketing",          nameAr: "تسويق",          icon: "📣", color: "#ef4444", colorSoft: "#fee2e2", subcategories: [
    { id: "medical-rep",    name: "Medical Representative", nameAr: "مندوب طبي" },
  ]},
  { id: "healthcare",     name: "Healthcare",         nameAr: "رعاية صحية",     icon: "🩺", color: "#06b6d4", colorSoft: "#cffafe", subcategories: [
    { id: "nursing",            name: "Nursing",              nameAr: "تمريض" },
    { id: "physiotherapy",      name: "Physiotherapy",        nameAr: "علاج طبيعي" },
    { id: "speech-therapy",     name: "Speech Therapy",       nameAr: "علاج النطق" },
    { id: "elderly-care",       name: "Elderly Care",         nameAr: "رعاية المسنين" },
    { id: "midwife",            name: "Midwife",              nameAr: "قابلة" },
    { id: "dentist-assistant",  name: "Dentist Assistant",    nameAr: "مساعد طبيب أسنان" },
    { id: "pharmacy-assistant", name: "Pharmacy Assistant",   nameAr: "مساعد صيدلي" },
  ]},
  { id: "graphic-design",  name: "Graphic Design",   nameAr: "تصميم جرافيك",  icon: "🖌️", color: "#f97316", colorSoft: "#ffedd5", subcategories: [] },
  { id: "education",       name: "Education",         nameAr: "تعليم",          icon: "🎓", color: "#0ea5e9", colorSoft: "#e0f2fe", subcategories: [
    { id: "private-teacher",    name: "Private Teacher",          nameAr: "مدرس خاص" },
    { id: "school-management",  name: "School Management",        nameAr: "إدارة مدرسية" },
    { id: "special-needs",      name: "Special Needs Education",  nameAr: "تعليم ذوي الاحتياجات الخاصة" },
  ]},
  { id: "workers",         name: "Workers & Professions", nameAr: "عمال ومهن",  icon: "🔧", color: "#64748b", colorSoft: "#f1f5f9", subcategories: [] },
  { id: "hotels",          name: "Hotels & Restaurants",  nameAr: "فنادق ومطاعم", icon: "🏨", color: "#f43f5e", colorSoft: "#ffe4e6", subcategories: [] },
  { id: "sports",          name: "Sports Coach",          nameAr: "مدرب رياضي",   icon: "🏋️", color: "#22c55e", colorSoft: "#dcfce7", subcategories: [] },
  { id: "press-tv",        name: "Press & TV",            nameAr: "صحافة وتلفزيون", icon: "📺", color: "#a855f7", colorSoft: "#f3e8ff", subcategories: [] },
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
