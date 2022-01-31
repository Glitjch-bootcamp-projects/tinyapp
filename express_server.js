const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const generateHelpers = require('./helpers');

const { generateUid, getUserByEmail, verifyPassword } = generateHelpers(bcrypt);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ["the wheels on the bus go square and square", "jonny", "bonnie"],
}));

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//****************************DATABASE*********************************/
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    user_ID: "i89a"
  },
  sm5xK8: {
    longURL: "http://www.google.com",
    user_ID: "i89a"
  },
  o95xK8: {
    longURL: "http://www.nintendo.com",
    user_ID: "iii"
  },
  rt5xK8: {
    longURL: "http://www.google.com",
    user_ID: "iii"
  }
};


const users = {
  i89a: {
    id: 'i89a',
    email: 'Jelly@bean.com',
    password: '$2a$10$LkHgq6hcVSBZywIhRapfSOJPi1S33lGvYX1Pu4Ne/CeweCa1OnfeK'
  }
};

//******************************ROUTES*********************************/

// redirects to main or login page
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  res.redirect('/urls');
});


// generates shortURL and redirects to its unique page
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send('Error. You must first sign in.');
  }
  if (req.body.longURL) {
    const shortURL = generateUid();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      user_ID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});


//++++++++++++++++++++++++++++++++++++++++++++++++++
//
// MAIN PAGE
// ...with URLs database
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
    user_ID: req.session.user_id,
  };
  res.render("urls_index", templateVars);
});
//      _______     ______/\______
//      |     |    [ Welcome Home ]
//      |     |     ``````````````
//++++++++++++++++++++++++++++++++++++++++++++++++++


// creates a new shortURL for users only
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});


// displays the unique page of the new shortURL
app.get("/urls/:shortURL", (req, res) => {
  // displays error if shortURL does not exist
  if (!urlDatabase[req.params.shortURL]) {
    res.send("error. That short URL does not exist.");
    res.end();
  }
  // prohibits user from accessing non-owned shortURL
  if (req.session.user_id !== urlDatabase[req.params.shortURL].user_ID) {
    res.send("Error. You do not have permission to access this link. \n");
    res.end();
  }
  // prohibits access to shortURL for logged out users 
  if (!req.session.user_id) {
    res.send("Error. You do not have permission to access this link. \n");
    res.end();
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});


// deletes an entry of shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.send("Error. You do not have permission to delete or modify this link. \n");
    res.end();
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


// updates already existing shortURL with a longURL
app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.session.user_id) {
    res.send("Error. You do not have permission to delete or modify this link. \n");
    res.end();
  }
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (longURL) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
  }
});


// links to the edit page of shortURL, usually from home page
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});


// registers a new user only
app.post('/register', (req, res) => {
  console.log("log: New user registering!");
  const userEmail = req.body.email;

  // prohibits empty fields
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send(`error 400. Invalid ${!req.body.email && !req.body.password ? 'email and password' : !req.body.email ? 'email' : 'password'}`);
    res.end();
  }
  if (getUserByEmail(userEmail, users)) {
    res.statusCode = 400;
    res.send("error 400. Email already exists.");
    res.end();
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const user_ID = generateUid();

  // sets the cookie and adding new user info to database
  req.session.user_id = user_ID;
  users[req.session.user_id] = {
    id: user_ID,
    email: userEmail,
    password: hashedPassword
  };
  res.redirect('/urls');
});


// displays the registration page with form
app.get('/registration', (req, res) => {
  console.log('log: Rendering registration');
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: req.session.user_id,
  };
  res.render('registration', templateVars);
});


// logs in an existing user, with correct fields
app.post('/login', (req, res) => {
  console.log('log: Client attempting to log in');

  // displays error if user email is not in users database: Note: matchUser conditions MUST precede matchPassword below.
  const matchUser = getUserByEmail(req.body.email, users);
  if (!matchUser) {
    res.statusCode = 403;
    res.send('Error 403. Username does not match.');
    res.end();
  }
  // displays error if user password is incorrect. Note: matchPassword conditions MUST follow matchUser above.
  const matchPassword = verifyPassword(matchUser, req.body.password, users);
  if (!matchPassword) {
    res.statusCode = 403;
    res.send('Error 403. Password does not match.');
    res.end();
  }
  req.session.user_id = matchUser;
  res.redirect('/urls');
});


// displays the login page with form
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('login', templateVars);
});


// clears cookie when clicking logout button, and redirects to home
app.post('/logout', (req, res) => {
  if (req.session.user_id) {
    res.clearCookie("session.sig");
    res.clearCookie("session");
    res.redirect('/urls');
  }
});


// redirects to specific external link
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("error. That short URL does not exist.");
    res.end();
  }
  console.log("log", req.ip);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


// defaults an Error 404
app.get('*', (req, res) => {
  res.send('ERROR 404');
  res.end();
});