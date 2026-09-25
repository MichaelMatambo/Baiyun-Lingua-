// ============================================================
// BaiYun Lingua — Firebase layer
// Firebase v10 modular SDK, loaded straight from Google's CDN.
// No npm, no bundler — every page that needs Firebase loads
// this file with <script type="module" src="/js/firebase.js">.
// ============================================================

import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc,
  onSnapshot, query, orderBy, where, serverTimestamp, limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ---------------------------------------------------------
   COURSES  (collection: "courses")
   Each doc: { language, title, level, description, priceUSD, image }
--------------------------------------------------------- */

/** Fetch all courses once and render them into a container using a card template fn. */
export async function loadCourses(renderCard, containerEl) {
  try {
    const snap = await getDocs(collection(db, "courses"));
    if (snap.empty) {
      containerEl.innerHTML = `<p class="text-center text-charcoal/60 col-span-full py-10">
        Courses will appear here once they're added in Firestore. See README for the schema.
      </p>`;
      return;
    }
    containerEl.innerHTML = "";
    snap.forEach((docSnap) => {
      containerEl.insertAdjacentHTML("beforeend", renderCard({ id: docSnap.id, ...docSnap.data() }));
    });
  } catch (err) {
    console.error("loadCourses failed:", err);
    containerEl.innerHTML = `<p class="text-center text-burgundy col-span-full py-10">
      Couldn't load courses right now. Please refresh.
    </p>`;
  }
}

/** Fetch only the courses matching a language filter (e.g. "mandarin"), or all if language is "all". */
export async function loadCoursesByLanguage(language, renderCard, containerEl) {
  try {
    const coursesRef = collection(db, "courses");
    const q = language && language !== "all"
      ? query(coursesRef, where("language", "==", language))
      : coursesRef;
    const snap = await getDocs(q);
    containerEl.innerHTML = "";
    if (snap.empty) {
      containerEl.innerHTML = `<p class="text-center text-charcoal/60 col-span-full py-10">No courses found for this filter yet.</p>`;
      return;
    }
    snap.forEach((docSnap) => {
      containerEl.insertAdjacentHTML("beforeend", renderCard({ id: docSnap.id, ...docSnap.data() }));
    });
  } catch (err) {
    console.error("loadCoursesByLanguage failed:", err);
  }
}

/* ---------------------------------------------------------
   ENROLLMENTS  (collection: "enrollments")
   Doc shape: { name, phone, email, language, level, message, paid:false, createdAt }
--------------------------------------------------------- */

export async function submitEnrollment(data) {
  return addDoc(collection(db, "enrollments"), {
    name: data.name,
    email: data.email,
    phone: data.phone,
    language: data.language,
    level: data.level,
    message: data.message || "",
    paid: false,
    createdAt: serverTimestamp()
  });
}

/** Admin: fetch every enrollment, most recent first. */
export async function loadEnrollments() {
  const q = query(collection(db, "enrollments"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Admin: flip an enrollment's paid status. */
export async function setEnrollmentPaid(enrollmentId, paid) {
  return updateDoc(doc(db, "enrollments", enrollmentId), { paid });
}

/* ---------------------------------------------------------
   AUTH  (my-courses.html)
--------------------------------------------------------- */

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginStudent(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerStudent(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function logoutStudent() {
  return signOut(auth);
}

/** A student's own enrollments, matched by the email they logged in with. */
export async function loadMyEnrollments(email) {
  const q = query(collection(db, "enrollments"), where("email", "==", email));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------------------------------------------------
   COMMUNITY CHAT  (collection: "messages")
   Doc shape: { user, club, text, createdAt }
--------------------------------------------------------- */

/** Live-subscribe to the last 100 messages in a club room. Returns an unsubscribe fn. */
export function watchClubMessages(club, onMessages) {
  const q = query(
    collection(db, "messages"),
    where("club", "==", club),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onMessages(msgs);
  }, (err) => console.error("watchClubMessages failed:", err));
}

export async function sendClubMessage(club, user, text) {
  return addDoc(collection(db, "messages"), {
    club, user, text, createdAt: serverTimestamp()
  });
}

export { auth, db };
