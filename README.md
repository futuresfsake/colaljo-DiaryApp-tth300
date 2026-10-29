# Diary App (tth300 mini system)

A personal diary web app: write, edit, delete, search and filter entries by mood.

**Stack:** Node.js, Express 5, MySQL (mysql2), vanilla HTML/CSS/JS.

## Setup
1. Import the database: `mysql -u root -p < db/diary_db.sql`
2. Set your MySQL password in `server.js` (`createPool`).
3. `npm install`
4. `npm start`, then open http://localhost:3000

## Structure
- `db/diary_db.sql` – schema + sample data
- `server.js` – REST API (`/api/entries`, `/api/moods`)
- `public/` – frontend
