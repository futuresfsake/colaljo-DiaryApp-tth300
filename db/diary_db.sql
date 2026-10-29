-- ========================================================
-- DIARY (mapped to server.js / public/js/script.js)
-- ========================================================

CREATE DATABASE IF NOT EXISTS diary_db CHARACTER SET utf8mb4;
USE diary_db;

DROP TABLE IF EXISTS entries;
DROP TABLE IF EXISTS moods;

-- Lookup table for moods
CREATE TABLE moods (
    mood_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    emoji VARCHAR(10) NOT NULL
) CHARACTER SET utf8mb4;

-- Diary entries
CREATE TABLE entries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    mood_id INT NULL,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_entries_mood
        FOREIGN KEY (mood_id) REFERENCES moods(mood_id)
        ON DELETE SET NULL
) CHARACTER SET utf8mb4;

-- Sample data
INSERT INTO moods (name, emoji) VALUES
    ('Happy', '😊'),
    ('Calm', '😌'),
    ('Excited', '🤩'),
    ('Tired', '😴'),
    ('Sad', '😢'),
    ('Stressed', '😣');

INSERT INTO entries (title, content, mood_id, entry_date) VALUES
    ('First entry', 'Started my diary app today. Excited to write down my days here.', 3, CURDATE()),
    ('Study session', 'Spent the afternoon on my integrative programming project. Tiring but worth it.', 4, CURDATE() - INTERVAL 1 DAY),
    ('Quiet evening', 'Had a slow evening, some tea and music. Felt very calm.', 2, CURDATE() - INTERVAL 2 DAY);
