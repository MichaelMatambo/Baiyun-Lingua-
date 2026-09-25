# BaiYun Lingua — website

A plain HTML/CSS/JavaScript website (no React, no Next.js, no build step) with
Firebase for data, auth, and hosting.

```
baiyun-lingua/
├── index.html          Homepage
├── languages.html       All 7 languages + live course listing
├── about.html            BaiYun Laoshi's story
├── enroll.html            Enrollment form + payment placeholders
├── my-courses.html         Student dashboard (Firebase Auth)
├── admin.html                Enrollments table (password-gated)
├── community.html              Real-time language-club chat
├── css/style.css
├── js/
│   ├── main.js           Menu, scroll reveal, nav — no Firebase
│   ├── firebase.js        All Firestore/Auth calls
│   └── firebase-config.js  Your Firebase project keys go here
└── README.md
```

Every page is plain HTML — open `index.html` directly in a browser and the
site works. It only *talks to Firebase* once you fill in `js/firebase-config.js`
and set up the pieces below.

---

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it (e.g. `baiyun-lingua`).
2. In the project, click the **</>** (web) icon to register a web app. Firebase shows you a `firebaseConfig` object.
3. Paste those values into `js/firebase-config.js`, replacing the placeholders.

## 2. Turn on the products you're using

In the Firebase console sidebar:

- **Build → Authentication** → Sign-in method → enable **Email/Password**. This powers `my-courses.html`.
- **Build → Firestore Database** → Create database → start in **production mode** (rules below lock it down properly).
- **Build → Storage** → only needed if you'll upload real course/portrait images later.
- **Build → Hosting** → used for deployment in step 5.

## 3. Firestore collections

You don't need to pre-create these — the site creates documents the first
time someone enrolls, chats, etc. But here's the shape, for reference and for
manually seeding `courses`:

**`courses`** — power the "Choose your language" and "Available courses" grids
```
{
  language: "mandarin",       // matches the <select> values in enroll.html
  title: "Mandarin HSK 1–2",
  level: "Beginner",
  description: "...",
  priceUSD: 45,
  image: "https://..."         // optional
}
```

**`enrollments`** — written by enroll.html, read by admin.html and my-courses.html
```
{
  name: "Jane Student",
  email: "jane@example.com",
  phone: "+263 77 123 4567",
  language: "mandarin",
  level: "beginner",
  message: "HSK 3 by December",
  paid: false,
  createdAt: <server timestamp>
}
```

**`messages`** — power community.html's live chat, one club per `club` value
```
{
  club: "mandarin",             // one of: mandarin, english, korean, japanese, spanish, french, portuguese
  user: "Jane",
  text: "你好!",
  createdAt: <server timestamp>
}
```

### Seeding a few courses quickly
Firestore console → your database → **Start collection** → `courses` → add a
few documents matching the shape above. The `languages.html` and `index.html`
pages will show them immediately, no redeploy needed.

## 4. Firestore security rules

Start here, then tighten as needed. This lets anyone submit an enrollment or
chat message (needed since there's no login for enrolling), lets anyone read
courses and messages, but stops the public from reading everyone else's
enrollment data directly:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /courses/{courseId} {
      allow read: if true;
      allow write: if false; // manage courses from the console, or add admin auth later
    }

    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.resource.data.text is string
                    && request.resource.data.text.size() < 1000;
      allow update, delete: if false;
    }

    match /enrollments/{enrollmentId} {
      allow create: if request.resource.data.email is string;
      allow read, update: if request.auth != null; // see "Admin panel security" below
    }
  }
}
```

### Admin panel security — read this before going live
`admin.html` is gated by a **client-side password** (`ADMIN_PASSWORD` in
`js/firebase-config.js`) so anyone who reads the page's JavaScript can see the
password and, more importantly, the rules above allow `read, update` on
`enrollments` to *any signed-in user*, not just you. For a real launch:

1. Turn on Firebase Auth for yourself (an admin email/password or Google sign-in).
2. Set a [custom claim](https://firebase.google.com/docs/auth/admin/custom-claims) like `admin: true` on your own account via a Cloud Function or the Admin SDK.
3. Change the enrollments rule to `allow read, update: if request.auth.token.admin == true;`
4. Replace the password gate in `admin.html` with a real `loginStudent()`-style call and check `request.auth.token.admin` before showing the table.

The current setup is fine for a small team you trust with the password, not
for a public-facing admin URL.

## 5. Deploy with Firebase Hosting

```bash
npm install -g firebase-tools     # one-time
firebase login
cd baiyun-lingua
firebase init hosting             # choose your project, public dir = "." , single-page app = No
firebase deploy
```

`firebase init` will offer to create `firebase.json` and `.firebaserc` for
you — accept the defaults except set the public directory to `.` (the folder
this README is in) so it serves the HTML files directly.

## 6. Payments

- **Paynow (Zimbabwe — EcoCash / ZiG / card):** the button in `enroll.html`
  is a placeholder. Paynow's integration requires a server-side call (their
  Integration ID + Key must never sit in client-side JS), so wire the button
  to a small backend (a Firebase Cloud Function is a natural fit) that calls
  [Paynow's API](https://developers.paynow.co.zw/) and, on success, calls
  `setEnrollmentPaid()` from `js/firebase.js`.
- **Stripe (international):** replace the placeholder link in `enroll.html`
  with a real [Stripe Payment Link](https://dashboard.stripe.com/payment-links).
  The code already appends `?client_reference_id=<enrollmentId>` so a Stripe
  webhook can match the payment back to the right enrollment automatically.

## 7. What's a placeholder vs. what's real

- **Real and working today:** all layout/CSS/JS, the enrollment form write,
  the admin table read/update, the community chat, student login.
- **Needs your input:** `js/firebase-config.js` keys, `courses` documents,
  portrait/course images, Paynow + Stripe wiring, tightened security rules.
