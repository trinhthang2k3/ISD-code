const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3500;

const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'userauth'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true
}));

// Registration route
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const sql = 'INSERT INTO user_info (user_name, user_pass) VALUES (?,?)';
    const values = [username,password];

    db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          res.send('Registration failed');
          return;
        }
        console.log('Registration successful');
        res.send('Registration successful!');
      });
    });

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM user_info WHERE user_name = ?'
    const values = [username]

    db.query(sql, values, async (err, results) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          res.status(500).send('Loginn failed');
          return;
        }
    
        if (results.length === 0) {
          res.status(401).send('Invalid username');
          return;
        }
        
    const user = results[0];
    const storedPassword = user.password;
        try {
            const match = await bcrypt.compare(password, storedPassword);
      
            if (!match) {
              res.status(401).send('Invalid password');
              return;
            }
      
            // Successful login
            res.send('Login successful!');
          } catch (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).send('Login failed');
          }
        });
    });


// Home route
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.send('Welcome, ' + req.session.user_name + '!');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req,res) =>{
    res.sendFile('testnode/public/index.html')
})
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


