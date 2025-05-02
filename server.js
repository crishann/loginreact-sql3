const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

// Serve static files (photos) from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// SQLite DB connection
const db = new sqlite3.Database('./studentdb.db', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to studentdb.db');
  }
});

// Multer setup for handling photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' folder exists
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensure file extension is kept
  }
});

const upload = multer({ storage });

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('📥 Login attempt:', email);

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.get(sql, [email, password], (err, row) => {
    if (err) {
      console.error('💥 SQL error:', err.message);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }

    if (row) {
      console.log('✅ Login success:', row.email);
      return res.status(200).json({ success: true, user: row });
    } else {
      console.log('❌ Invalid credentials');
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
  });
});

// Default route for browser check
app.get('/', (req, res) => {
  res.send('🎉 Backend is working!');
});

// Get all students
app.get('/students', (req, res) => {
  console.log('Received request for students');
  const sql = 'SELECT * FROM students';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching students:', err.message);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
    console.log('Fetched students:', rows);
    res.status(200).json(rows);
  });
});

// Get student by ID
app.get('/students/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM students WHERE id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching student:', err.message);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
    if (row) {
      res.status(200).json(row);
    } else {
      res.status(404).json({ success: false, error: 'Student not found' });
    }
  });
});

// ✅ Add/update student info (PUT)
app.put('/students/:id', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { idno, lastname, firstname, course, level } = req.body;

  // If a new photo is uploaded, get the file name
  let photo = req.file ? req.file.filename : null;

  const sql = `
    UPDATE students
    SET idno = ?, lastname = ?, firstname = ?, course = ?, level = ?, photo = ?
    WHERE id = ?
  `;

  db.run(sql, [idno, lastname, firstname, course, level, photo, id], function (err) {
    if (err) {
      console.error('Error updating student:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to update student' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student updated successfully' });
  });
});

// Update user info
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;

  const sql = 'UPDATE users SET email = ?, password = ? WHERE id = ?';
  db.run(sql, [email, password, id], function (err) {
    if (err) {
      console.error('Error updating user:', err.message);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User updated successfully' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
