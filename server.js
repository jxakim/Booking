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

// End the session
function End_Session(req, res) {
  // Clear cookies
  res.clearCookie('loggedin');
  res.clearCookie('bruker');

  res.render('konto/logg_inn', { message: 'Du ble logget ut.' });
}




// Innhold // ----------------------------------------------------------------- //

app.route('/')
  .get(async (req, res) => {
      Validate(req, res, 'booking', true);
  })


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



app.get('/dine_bookinger', (req, res) => {
    Validate(req, res, 'dine_bookinger', true);
});

app.route('/registrer')
  .get(async (req, res) => {
    res.render('konto/registrer', { message: null });
  })

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


app.get('/logg-inn', async (req, res) => {
  res.render('konto/logg_inn', { message: null });
})

app.get('/logg-ut', (req, res) => {
  End_Session(req, res);
});

app.get('/registrer', (req, res) => {
    res.render('konto/registrer', { message: null });
});


// SQL Requests

app.post('/get-ledige-plasser', async (req, res) => {
  if (Validate(req, res, '', false)) {
    const sql = "SELECT plasser.* FROM plasser INNER JOIN bookinger ON plasser.PlassID = bookinger.PlassID WHERE bookinger.Aktiv = true AND bookinger.dato = ?";
    const result = await queryDb(sql, [req.body.dato]);

    res.json({ result });
  }
});

app.post('/book-plass', async (req, res) => {
  if (Validate(req, res, '', false)) {
    const { PlassID, dato } = req.body;
    const Brukernavn = req.cookies.bruker;

    const sql = "INSERT INTO bookinger (Brukernavn, PlassID, Dato, Aktiv) values (?, ?, ?, ?)";
    const result = await queryDb(sql, [ Brukernavn, PlassID, dato, true ]);
   
    res.json({ result });
  }
});

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

// Assuming you have Express.js set up
app.post('/get-alle-bookinger', async(req, res) => {
  const Brukernavn = req.cookies.bruker;

  const sql = "SELECT * FROM bookinger WHERE brukernavn LIKE ?";
  const result = await queryDb(sql, [ Brukernavn ]);

  res.json({bookinger: result});
});




// Start serveren
const port = 2000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});