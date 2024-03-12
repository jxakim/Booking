const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4, NIL } = require('uuid');
const { read } = require('fs');
const { openDelimiter } = require('ejs');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// DB Connection // ----------------------------------------------------------------- //

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'booking',
});


// Query function for queries
function queryDb(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Kobler til MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});




// Innhold // ----------------------------------------------------------------- //

app.get('/', (req, res) => {
  res.render('booking');
});

app.get('/dine_bookinger', (req, res) => {
    res.render('dine_bookinger');
});

app.get('/login', (req, res) => {
    res.render('konto/logg_inn');
});

app.get('/registrer', (req, res) => {
    res.render('konto/registrer');
});


// SQL Requests

app.post('/ledige-plasser', async (req, res) => {
  const dato = req.body.dato;
  console.log('Received name from client:', dato);

  const sql = "SELECT plasser.* FROM plasser INNER JOIN bookinger ON plasser.PlassID = bookinger.PlassID WHERE bookinger.Aktiv = true AND bookinger.dato = ?";
  const result = await queryDb(sql, [req.body.dato]);
 
  res.json({ result });
});

// Start serveren
const port = 2000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});