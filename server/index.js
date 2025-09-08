const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const pool = require('./db');


const path = require('path');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from React build
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Catch-all: serve index.html for any non-API route (for React Router)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// User registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Simple in-memory session store (for demo only)
const sessions = {};
const crypto = require('crypto');

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = userResult.rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  // Create a session token
  const sessionId = crypto.randomBytes(16).toString('hex');
  sessions[sessionId] = { id: user.id, name: user.name, email: user.email };
  res.json({ sessionId });
});



// Middleware to authenticate session
function authenticateSession(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || !sessions[sessionId]) return res.sendStatus(401);
  req.user = sessions[sessionId];
  next();
}

// Get my fridge items
app.get('/api/my_fridge_items', authenticateSession, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM fridge_items WHERE user_id = $1 ORDER BY id',
    [req.user.id]
  );
  res.json(result.rows);
});

// Add fridge item (only self)
app.post('/api/fridge_items', authenticateSession, async (req, res) => {
  const { name, quantity } = req.body;
  const result = await pool.query(
    'INSERT INTO fridge_items (name, quantity, user_id) VALUES ($1, $2, $3) RETURNING *',
    [name, quantity, req.user.id]
  );
  res.json(result.rows[0]);
});

// Update fridge item (only self)
app.put('/api/fridge_items/:id', authenticateSession, async (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  // Only allow update if user owns the item
  const check = await pool.query('SELECT * FROM fridge_items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!check.rows.length) return res.sendStatus(403);
  const result = await pool.query(
    'UPDATE fridge_items SET name = $1, quantity = $2, date_updated = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [name, quantity, id]
  );
  res.json(result.rows[0]);
});

// Delete fridge item (only self)
app.delete('/api/fridge_items/:id', authenticateSession, async (req, res) => {
  const { id } = req.params;
  // Only allow delete if user owns the item
  const check = await pool.query('SELECT * FROM fridge_items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!check.rows.length) return res.sendStatus(403);
  await pool.query('DELETE FROM fridge_items WHERE id = $1', [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
