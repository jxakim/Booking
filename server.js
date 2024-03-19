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

// ---------------------------------------------- Database Kobling ---------------------------------------------- //

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'booking',
});

// Koble til MySQL
db.connect((err) => { if (err) throw err });

// ---------------------------------------------- Funksjoner ---------------------------------------------- //

// SQL Query håndtering
function queryDb(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Validasjon av bruker
async function Validate(req, res, route, redirect) {

  const cookieExists = req.cookies.loggedin;

  if (cookieExists) {
    try { 
      if (redirect) {
          res.render(route, { message: null });
      } else {
        return true;
      }
        
    } catch (error) {
      res.render('konto/logg_inn', { message: 'Det skjedde en feil ved innlogging.' });
    }
  } else {
    End_Session(req, res)
  }
}

// End Sesjonen (logg ut)
function End_Session(req, res) {
  // Clear cookies
  res.clearCookie('loggedin');
  res.clearCookie('bruker');

  res.render('konto/logg_inn', { message: null });
}

// ---------------------------------------------- Innhold ---------------------------------------------- //

// Index route
app.route('/')
  .get(async (req, res) => {
      Validate(req, res, 'booking', true);
  })

  // Login post
  .post(async (req, res) => {
    try {
      const { brukernavn, passord } = req.body;

      const sql = 'SELECT * FROM brukerdata WHERE TRIM(Brukernavn) = ?';
      const bruker = await queryDb(sql, [brukernavn]);

      if (bruker) {
        const passord_compare = await bcrypt.compare(passord, bruker[0].Hashed_Passord);

        if (passord_compare) {

          const cookie_tid_minutter = 5;
          res.cookie('loggedin', true, { maxAge: cookie_tid_minutter * 60 * 1000, httpOnly: true });
          res.cookie('bruker', brukernavn, { maxAge: cookie_tid_minutter * 60 * 1000, httpOnly: true });

          res.render('booking', { message: null });
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

// Dine bookinger route
app.get('/dine_bookinger', (req, res) => {
    Validate(req, res, 'dine_bookinger', true);
});

// --------- KONTO --------- //

// Registrering route
app.route('/registrer')
  .get(async (req, res) => {
    res.render('konto/registrer', { message: null });
  })

  // Registrering post
  .post(async (req, res) => {
    try {

      const { navn, brukernavn, passord, gjenta_passord } = req.body;

      // Krypter passordet
      const hash_passord = await bcrypt.hash(passord, 10);

      if (passord == gjenta_passord) {
        const sql1 = 'SELECT * FROM brukerdata WHERE Brukernavn LIKE ?';
        const result1 = await queryDb(sql1, [brukernavn]);

        if (result1) {
          const sql2 = 'INSERT INTO brukerdata (Navn, Brukernavn, Hashed_Passord) VALUES (?, ?, ?)';
          const result2 = await queryDb(sql2, [navn, brukernavn, hash_passord]);

          if (result2) {

            const cookie_tid_minutter = 5;
            res.cookie('loggedin', true, { maxAge: cookie_tid_minutter * 60 * 1000, httpOnly: true });
            res.cookie('bruker', brukernavn, { maxAge: cookie_tid_minutter * 60 * 1000, httpOnly: true });

            res.render('booking', { message: 'Du er nå registrert.' });
          } else {
            res.render('konto/registrer', { message: 'Noe feil skjedde under registrering' });
          }

        } else {
          res.render('konto/registrer', { message: 'En bruker med dette brukernavnet finnes allerede.' });
        }
      }

    } catch (error) {
      console.error('Error during login process:', error);
      res.render('konto/registrer', { message: 'Noe feil skjedde under registrering.' });
    }
  });

// Logg inn route
app.get('/logg-inn', async (req, res) => {
  res.render('konto/logg_inn', { message: null });
})

// Logg ut 
app.get('/logg-ut', (req, res) => {
  End_Session(req, res);
});


// ---------------------------------------------- SQL Requests ---------------------------------------------- //

// Request som får tak i alle ledige plasser for en dato
app.post('/get-ledige-plasser', async (req, res) => {
  if (Validate(req, res, '', false)) {
    const sql = "SELECT plasser.* FROM plasser INNER JOIN bookinger ON plasser.PlassID = bookinger.PlassID WHERE bookinger.Aktiv = true AND bookinger.dato = ?";
    const result = await queryDb(sql, [req.body.dato]);

    res.json({ result });
  }
});

// Request som booker en plass
app.post('/book-plass', async (req, res) => {
  if (Validate(req, res, '', false)) {
    const { PlassID, dato } = req.body;
    const Brukernavn = req.cookies.bruker;

    const sql = "INSERT INTO bookinger (Brukernavn, PlassID, Dato, Aktiv) values (?, ?, ?, ?)";
    const result = await queryDb(sql, [ Brukernavn, PlassID, dato, true ]);
   
    res.json({ result });
  }
});

// Request som avbooker enplass
app.post('/avbook-plass', async (req, res) => {
  if (Validate(req, res, '', false)) {
    const { PlassID } = req.body;

    const sql = "DELETE FROM bookinger WHERE PlassID LIKE ?";
    const result = await queryDb(sql, [ PlassID ]);
    
    if (result) {
      res.json({ result });
    }
  }
});

// Sjekker om brukeren har booket på en plass før
app.post('/sjekk-bruker-booket', async (req, res) => {
  if (Validate(req, res, '', false)) {
    const { Dato } = req.body;
    const Brukernavn = req.cookies.bruker;

    const sql = "SELECT * FROM bookinger WHERE Brukernavn = ? AND Dato = ? AND Aktiv = ?";
    const result = await queryDb(sql, [ Brukernavn, Dato, true ]);

    if (result.length > 0) {
      res.json({har_booket: true});
    } else {
      res.json({har_booket: false});
    }
  }
});

// Request som får alle plasser som en bruker har booket
app.post('/get-alle-bookinger', async(req, res) => {
  if (Validate(req, res, '', false)) {
    const Brukernavn = req.cookies.bruker;

    const sql = "SELECT * FROM bookinger WHERE brukernavn LIKE ?";
    const result = await queryDb(sql, [ Brukernavn ]);

    res.json({bookinger: result});
  }
});

// Request som får alle plasser som en bruker har booket
app.post('/get-plass-info', async(req, res) => {
  if (Validate(req, res, '', false)) {
    const { PlassID } = req.body;

    const sql = "select Skjerm,Tastatur,Mus from plasser where PlassID = ?";
    const result = await queryDb(sql, [ PlassID ]);

    res.json({info: result});
  }
});

// ---------------------------------------------- Siste server håndteringer ---------------------------------------------- //

// Start serveren med port 2000 (kan endres)
const port = 2000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});