const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// MySQL connection pool (import db/diary_db.sql first)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',            // Add your MySQL root password here
    database: 'diary_db',
    dateStrings: true,       // keep DATE columns as 'YYYY-MM-DD'
});

const ENTRY_SELECT = `
    SELECT e.entry_id, e.title, e.content, e.mood_id, e.entry_date,
           m.name AS mood_name, m.emoji AS mood_emoji
    FROM entries e
    LEFT JOIN moods m ON m.mood_id = e.mood_id`;

function validate(body) {
    const title = (body.title || '').trim();
    const content = (body.content || '').trim();
    const entryDate = body.entry_date;
    if (!title || !content || !/^\d{4}-\d{2}-\d{2}$/.test(entryDate || '')) return null;
    return { title, content, entryDate, moodId: body.mood_id || null };
}

app.get('/api/moods', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM moods ORDER BY mood_id');
    res.json(rows);
});

app.get('/api/entries', async (req, res) => {
    const { q, mood } = req.query;
    const where = [];
    const params = [];
    if (q) {
        where.push('(e.title LIKE ? OR e.content LIKE ?)');
        params.push(`%${q}%`, `%${q}%`);
    }
    if (mood) {
        where.push('e.mood_id = ?');
        params.push(mood);
    }
    const sql = `${ENTRY_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY e.entry_date DESC, e.entry_id DESC`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
});

app.post('/api/entries', async (req, res) => {
    const v = validate(req.body);
    if (!v) return res.status(400).json({ error: 'title, content and entry_date are required' });
    const [result] = await db.query(
        'INSERT INTO entries (title, content, mood_id, entry_date) VALUES (?, ?, ?, ?)',
        [v.title, v.content, v.moodId, v.entryDate]
    );
    const [rows] = await db.query(`${ENTRY_SELECT} WHERE e.entry_id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
});

app.put('/api/entries/:id', async (req, res) => {
    const v = validate(req.body);
    if (!v) return res.status(400).json({ error: 'title, content and entry_date are required' });
    const [result] = await db.query(
        'UPDATE entries SET title = ?, content = ?, mood_id = ?, entry_date = ? WHERE entry_id = ?',
        [v.title, v.content, v.moodId, v.entryDate, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Entry not found' });
    const [rows] = await db.query(`${ENTRY_SELECT} WHERE e.entry_id = ?`, [req.params.id]);
    res.json(rows[0]);
});

app.delete('/api/entries/:id', async (req, res) => {
    const [result] = await db.query('DELETE FROM entries WHERE entry_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Entry not found' });
    res.status(204).end();
});

app.listen(PORT, () => console.log(`Diary running at http://localhost:${PORT}`));
