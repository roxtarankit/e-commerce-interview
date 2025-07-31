const mysql = require('mysql2');
const fs = require('fs');
const { parse } = require('csv-parse');

// MySQL connection configuration (adjust username, password, and host as per your setup)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'Ankitsql@123', // Replace with your MySQL password
  database: 'ecommerce_db'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Create products table if it doesn't exist
connection.query(`CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY,
  cost DECIMAL(10,2),
  category VARCHAR(100),
  name VARCHAR(255),
  brand VARCHAR(100),
  retail_price DECIMAL(10,2),
  department VARCHAR(100),
  sku VARCHAR(50),
  distribution_center_id INT
)`, (err) => {
  if (err) throw err;
  console.log('Products table created or already exists');
});

// Load CSV data
fs.createReadStream('products.csv')
  .pipe(parse({ columns: true, skip_empty_lines: true }))
  .on('data', (row) => {
    connection.query(
      'INSERT INTO products (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [parseInt(row.id), parseFloat(row.cost), row.category, row.name, row.brand, parseFloat(row.retail_price), row.department, row.sku, parseInt(row.distribution_center_id)],
      (err) => {
        if (err) console.error(err.message);
      }
    );
  })
  .on('error', (err) => {
    console.error(err.message);
  })
  .on('end', () => {
    console.log('CSV data has been loaded into the database.');
  });

// Keep the connection open for verification
process.on('exit', () => connection.end());


// ... (previous code remains the same)

// Verify data
connection.query('SELECT * FROM products LIMIT 5', (err, results) => {
  if (err) throw err;
  console.log('Verification of loaded data:');
  results.forEach((row) => {
    console.log(`ID: ${row.id}, Name: ${row.name}, Cost: ${row.cost}, Retail Price: ${row.retail_price}, Department: ${row.department}`);
  });
});