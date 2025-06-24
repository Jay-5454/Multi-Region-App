const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const port = process.env.PORT || 80;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

app.get('/', (req, res) => {
  res.send(`🟢 Hello from ${process.env.REGION || 'unknown'} region!`);
});

// ⛏️ Create table if it doesn't exist
app.get('/init', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await conn.end();
    res.send('✅ Database initialized.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to initialize DB');
  }
});

// 💬 Store a message
app.post('/messages', async (req, res) => {
  try {
    const { content } = req.body;
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('INSERT INTO messages (content) VALUES (?)', [content]);
    await conn.end();
    res.send('✅ Message saved.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to save message');
  }
});

// 📖 Get all messages
app.get('/messages', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM messages ORDER BY created_at DESC');
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to fetch messages');
  }
});

app.listen(port, () => {
  console.log(`🚀 App running on port ${port}`);
});
