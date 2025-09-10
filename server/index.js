const ingredientRoutes = require('./routes/ingredient')(authenticateSession);
const fridgeRoutes = require('./routes/fridge')(authenticateSession);
const groceryRoutes = require('./routes/grocery')(authenticateSession);
const mealRoutes = require('./routes/meal')(authenticateSession);
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

// Middleware to authenticate session
function authenticateSession(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || !sessions[sessionId]) return res.sendStatus(401);
  req.user = sessions[sessionId];
  next();
}

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

// Return current user info
app.get('/api/me', authenticateSession, (req, res) => {
  res.json({ name: req.user.name, email: req.user.email, id: req.user.id });
});

// Modularized routes
app.use('/api', fridgeRoutes);
app.use('/api', groceryRoutes);
app.use('/api', ingredientRoutes);
app.use('/api', mealRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
