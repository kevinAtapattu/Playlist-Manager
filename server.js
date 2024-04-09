const express = require('express') //express framework
const bcrypt = require('bcrypt'); //to decrypt passwords
const sqlite3 = require('sqlite3').verbose(); //for database
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http')
const PORT = process.env.PORT || 3000 //allow environment variable to possible set PORT

const app = express()
const dbPath = path.join(__dirname, 'user_database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Could not open database at ${dbPath}:`, err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}`);
  }
});

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public')) //static server

// middleware to parse the body of the POST request
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
//Routes
app.get(['/searchSongs', '/mytunes.html', '/mytunes', '/index.html', '/'], (request, response) => {
  let title = request.query.title;
  if (!title) {
    response.sendFile(__dirname + '/views/index.html')
    return;
  }

  let titleWithPlusSigns = title.split(' ').join('+');
  
  let options = {
    host: 'itunes.apple.com',
    path: `/search?term=${titleWithPlusSigns}&entity=musicTrack&limit=3`,
  };

  http.request(options, function(apiResponse) {
    let songData = '';
    apiResponse.on('data', function(chunk) {
      songData += chunk;
    });
    apiResponse.on('end', function() {
      response.contentType('application/json').json(JSON.parse(songData));
    });
  }).end();
});

app.get(['/login'], (request, response) => {
  let title = request.query.title;
  if (!title) {
    response.sendFile(__dirname + '/views/login.html')
    return;
  }
});

app.get(['/signup'], (request, response) => {
  let title = request.query.title;
  if (!title) {
    response.sendFile(__dirname + '/views/signup.html')
    return;
  }
});

// login POST request
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      res.status(500).json({ error: "An error occurred. Please try again later." });
    } else if (row) {
      // User exists, now we compare the password
      const match = await bcrypt.compare(password, row.password);
      if (match) {
        // Passwords match, send a success response
        res.json({ url: '/' }); // Send JSON with the URL to redirect to
      } else {
        // Passwords do not match
        res.status(401).json({ error: "The password is incorrect." });
      }
    } else {
      // No user with that username
      res.status(404).json({ error: "No user found with that username." });
    }
  });
});

// signup POST request
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists
  db.get("SELECT username FROM users WHERE username = ?", [username], async (err, row) => {
    if (err) {
      console.error('Error checking for existing user:', err.message);
      res.status(500).json({ error: "An error occurred. Please try again." });
    } else if (row) {
      res.status(409).json({ error: "This username is already taken. Please choose another." });
    } else {
      // Username does not exist, proceed with hashing the password and creating the user
      try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const query = `INSERT INTO users (username, password, role) VALUES (?, ?, 'member')`;
        db.run(query, [username, hashedPassword], (insertErr) => {
          if (insertErr) {
            console.error('Error inserting new user:', insertErr.message);
            res.status(500).json({ error: "Couldn't register user. Please try again." });
          } else {
            res.json({ url: '/login' }); // Redirect to the login page after successful signup
          }
        });
      } catch (hashError) {
        console.error('Error hashing password:', hashError.message);
        res.status(500).json({ error: "Couldn't register user. Please try again." });
      }
    }
  });
});

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT}`)
    console.log(`To Test:`)
    console.log(`http://localhost:3000/login`)
  }
})
