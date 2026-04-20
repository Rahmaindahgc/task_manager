const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// ✅ Koneksi PostgreSQL
const pool = new Pool({
  user: 'rahmaindah',
  host: 'localhost',
  database: 'taskdb',
  password: '',
  port: 5432,
});

// ✅ Test koneksi
pool.connect((err) => {
  if (err) {
    console.error('Koneksi gagal:', err);
  } else {
    console.log('Koneksi database berhasil!');
  }
});

// ✅ Middleware Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date()}`);
  next();
});

// ==========================
// ✅ GET ALL TASKS
// ==========================
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ==========================
// ✅ GET TASK BY ID
// ==========================
app.get('/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id=$1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ==========================
// ✅ CREATE TASK (POST)
// ==========================
app.post('/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;

    // ✅ Validasi 400
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title tidak boleh kosong' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ==========================
// ✅ UPDATE TASK (PUT)
// ==========================
app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, is_completed } = req.body;

    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, is_completed=$3 WHERE id=$4 RETURNING *',
      [title, description, is_completed, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ==========================
// ✅ DELETE TASK
// ==========================
app.delete('/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id=$1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Data berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ==========================
// ✅ RUN SERVER
// ==========================
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});