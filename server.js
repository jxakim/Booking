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





// Start serveren
const port = 2000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});