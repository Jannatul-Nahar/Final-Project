const mysql = require('mysql2');
require('dotenv').config();

// Create a connection to the database
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the MySQL database!');
        connection.release(); // Release the connection back to the pool
    }
});

module.exports = db;
