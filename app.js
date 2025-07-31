// 1. Load environment variables and required modules
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// 2. Create Express application
const app = express();

// 3. Middleware setup
app.use(cors());
app.use(express.json());

// 4. Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// 5. API Routes

// Get all products (paginated)
app.get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.query(
    'SELECT * FROM products LIMIT ? OFFSET ?',
    [limit, offset],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    }
  );
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  db.query(
    'SELECT * FROM products WHERE id = ?',
    [productId],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(results[0]);
    }
  );
});

// Add this route handler (place it before app.listen)
app.get('/', (req, res) => {
  res.send('Welcome to the E-Commerce API!');
});

// 6. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});