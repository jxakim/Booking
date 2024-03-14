const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const bcrypt = require('bcryptjs');
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

// Innholdsfunksjoner // ------------------------------------------------------ //

// Validasjon av bruker
async function Validate(req, res, route, redirect) {

  const cookieExists = req.cookies.loggedin;

  if (cookieExists) {
    const brukernavn = req.cookies.brukernavn;

    try {
      if (redirect) {
          res.render(route, {brukernavn, message: null});
      } else {
        return true;
      }
        
    } catch (error) {
      res.render('konto/logg_inn', { message: 'Det skjedde en feil ved innlogging.' });
    }
  } else {
    res.render('konto/logg_inn', { message: null });
  }
}

// End the session
function End_Session(req, res) {
  // Clear cookies
  res.clearCookie('loggedin');
  res.clearCookie('brukernavn');

  res.render('/', { message: 'Du logget ut.' });
}




// Innhold // ----------------------------------------------------------------- //

app.route('/')
  .get(async (req, res) => {
    const cookieExists = req.cookies.loggedin;
    if (cookieExists) {
      console.log("Cookie eksisterer");
      Validate(req, res, 'booking', true);
    } else {
      res.render('konto/logg_inn', { message: null });
    }
  })


  .post(async (req, res) => {
    try {

      const { brukernavn, passord } = req.body;

      const sql = 'SELECT * FROM brukerdata WHERE TRIM(Brukernavn) = ?';
      const bruker = await queryDb(sql, [brukernavn]);

      if (bruker.length === 1) {
        const passord_compare = await bcrypt.compare(passord, bruker[0].Hashed_Passord);

        if (passord_compare) {

          const cookie_tid_minutter = 5;
          res.cookie('loggedin', true, { maxAge: cookie_tid_minutter * 60 * 1000, httpOnly: true });
          res.cookie('bruker', brukernavn, { maxAge: cookie_tid_minutter * 60 * 1000, httpOnly: true });

          res.render('booking', { brukernavn, message:'Velkommen!' });
        } else {
          res.render('konto/logg_inn', { message: 'Feil passord.' });
        }
      } else {
        res.render('konto/logg_inn', { message: 'Feil brukernavn.' });
      }

    } catch (error) {
      console.error('Error during login process:', error);
      res.render('konto/logg_inn', { message: 'Noe feil skjedde under innloggingen.' });
    }
  });

app.get('/dine_bookinger', (req, res) => {
    res.render('dine_bookinger');
});

app.route('/login')
  .get(async (req, res) => {
    res.render('/', { message: null });
  })

app.get('/registrer', (req, res) => {
    res.render('konto/registrer');
});


// SQL Requests

app.post('/get-ledige-plasser', async (req, res) => {

  const sql = "SELECT plasser.* FROM plasser INNER JOIN bookinger ON plasser.PlassID = bookinger.PlassID WHERE bookinger.Aktiv = true AND bookinger.dato = ?";
  const result = await queryDb(sql, [req.body.dato]);
 
  res.json({ result });
});

app.post('/book-plass', async (req, res) => {
  const [BrukerId, PlassID, dato] = req.body.dato;

  const sql = "INSERT INTO bookinger (BrukerID, PlassID, Dato, Aktiv) values (?, ?, ?, ?)";
  const result = await queryDb(sql, (BrukerID, PlassID, dato, true));
 
  res.json({ result });
});

app.post('/get-plasser', async (req, res) => {
  
  const sql = "SELECT * FROM PLASSER";
  const result = await queryDb(sql);

  res.json({result: result})
})




// Start serveren
const port = 2000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});