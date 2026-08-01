# Campus Mess OS

A student meal confirmation app: students say Yes/No to each meal, admins see live confirmation counts.

## Folder structure

```
campus-mess-os/
  backend/     Express + Prisma + PostgreSQL API
  frontend/    React + Vite + Tailwind app
```

## 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your machine, and create a database:

```sql
CREATE DATABASE campus_mess;
```

## 2. Backend setup

```
cd backend
npm install
```

Open `.env` (already created from `.env.example`) and set your real Postgres username/password in `DATABASE_URL`, e.g.:

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/campus_mess?schema=public"
```

Then run the migration to create the tables:

```
npx prisma migrate dev --name init
```

Start the server:

```
node src/server.js
```

You should see: `Server running on http://localhost:5000`

Leave this terminal running.

## 3. Frontend setup

Open a **new** terminal:

```
cd frontend
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`) in your browser.

## 4. Set up real password reset emails (optional but recommended)

Right now, if you leave `EMAIL_USER`/`EMAIL_PASS` blank in `backend/.env`, "Forgot password" still works, but instead of emailing the link it shows the link directly on screen (labeled "dev mode"). To send real emails instead:

1. Go to your Google Account → **Security** → turn on **2-Step Verification** (required to create an App Password)
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create a new app password (name it anything, e.g. "Campus Mess OS")
4. Google gives you a 16-character password — copy it
5. In `backend/.env`, set:
   ```
   EMAIL_USER="youraddress@gmail.com"
   EMAIL_PASS="the16characterapppassword"
   ```
   (no spaces in the app password)
6. Restart the backend (`Ctrl+C`, then `node src/server.js` again)

Now "Forgot password" sends a real email instead of showing the link on screen.

## 5. Using the app

- Go to **Sign up**, create a Student account, or a Mess Admin account (admin access code: `MESS2026`, changeable in `backend/.env`)
- Students land on `/dashboard` and can mark Yes/No per meal — this saves to the database immediately
- **Each meal locks automatically 2 hours before it starts** — both in the UI (buttons grey out, status shows "Locked") and on the server (it rejects the request even if someone bypasses the UI), so this can't be gamed by editing the page
- Admins land on `/admin` and see live confirmed counts per meal, pulled from real student responses
- Password fields have a show/hide eye toggle everywhere they appear
- Both terminals (backend `node src/server.js` and frontend `npm run dev`) must stay running at the same time

## If you already had this project running before this update

This update added a new database table (`PasswordResetToken`) for the forgot-password flow. Run the migration again before starting the backend:

```
cd backend
npx prisma migrate dev --name add_password_reset
```

This only adds the new table — your existing users and meal responses are untouched.

## If you're pulling in the menu/leave/feedback/complaints update

This update added five new tables (`Leave`, `MenuItem`, `MealFeedback`, `Complaint`) and three new fields on `User` (`dietTag`, `dietNote`, `remindersOn`). Run:

```
cd backend
npm install          # picks up the new node-cron dependency
npx prisma migrate dev --name add_menu_leave_feedback_complaints
```

Existing users, meal responses, and reset tokens are untouched — this only adds new tables/columns.

### What's new for students (all reachable from the sidebar)

- **Menu** (`/menu`) — see what's being served for each meal before confirming
- **Leave mode** (`/leave`) — set a date range and every meal in it is auto-marked No
- **History** (`/history`) — personal stats: meals responded to, Yes/No counts, day-by-day
- **Feedback** (`/feedback`) — 1-5 star rating + optional comment per meal
- **Complaints** (`/complaints`) — report an issue (hygiene, quantity, timing), track its status and any admin reply
- **Profile** (`/profile`) — set a diet tag (vegetarian/vegan/eggetarian/allergy) and turn cutoff reminder emails on/off

### What's new for admins

- **Menu management** (`/admin/menu`) — edit the weekly menu per day/meal; this is what powers the student Menu page
- **Feedback & ratings** (`/admin/feedback`) — average rating per meal type + recent comments
- **Complaints inbox** (`/admin/complaints`) — filter by status, reply, and mark resolved
- **Diet breakdown** (`/admin/diet`) — headcount by diet tag across all students

### Meal cutoff reminder emails

If `EMAIL_USER`/`EMAIL_PASS` are set in `backend/.env` (see section 4 above), a cron job checks every 15 minutes and emails any student who hasn't responded yet, about 30 minutes before that meal's cutoff. Students can opt out from their Profile page. If email isn't configured, this job silently does nothing — nothing else is affected.

## Notes

- Passwords are hashed with bcrypt; sessions use JWT tokens stored in the browser's localStorage
- The "food waste trend" chart on the admin dashboard is still placeholder data — not wired to anything real yet (a good next feature to tackle)
- Reset tokens expire after 30 minutes and can only be used once
- The meal cutoff times are defined in **three** places that must stay in sync: `MEALS` in `frontend/src/pages/StudentDashboard.jsx`, `MEAL_START_HOURS` in `backend/src/routes/meals.js`, and `MEAL_START_HOURS` in `backend/src/jobs/reminders.js`
- Leave mode auto-marks meals No at the moment you submit it; it doesn't retroactively lock the toggle, so a student can still manually flip a day back to Yes afterward if plans change
