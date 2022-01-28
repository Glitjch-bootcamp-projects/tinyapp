const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const generateHelpers = require('./helpers');

const { generateUid, getUserByEmail, verifyPassword }  = generateHelpers(bcrypt);

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

// redirect to urls because nothing is on root page
app.get("/", (req, res) => {
  res.redirect('/urls');
});


// generate shortURL and redirect to its detail page
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    if (req.body.longURL) {
      const shortURL = generateUid();
      urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        user_ID: req.session.user_id
      };
      res.redirect(`/urls/${shortURL}`);
    }
  } else {
    res.send('Error. You must first sign in.');
  }
});


//++++++++++++++++++++++++++++++++++++++++++++++++++
//
// MAIN PAGE
// main page with the URLs database
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


// create a new entry URL
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


// display the longURL on a page with the new shortURL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.send("Error. You do not have permission to access this link. \n");
    res.end();
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  }
  res.render("urls_show", templateVars);
});


// delete an entry
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.send("Error. You do not have permission to delete or modify this link. \n");
    res.end();
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


// update already existing shortURL with a different longURL
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


// link to edit shortURL page, from home page
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});



// REGISTRATION
app.post('/register', (req, res) => {
  console.log("New user registered!");
  const userEmail = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const user_ID = generateUid();

  // prohibit empty fields
  if (!userEmail || !hashedPassword) {
    res.statusCode = 400;
    res.send("error 400. Invalid email or password");
    res.end();
  }
  if (getUserByEmail(userEmail, users)) {
    res.statusCode = 400;
    res.send("error 400. Email already exists.");
    res.end();
  }
  //setting the cookie and adding new user info to database
  req.session.user_id = user_ID;
  users[req.session.user_id] = {
    id: user_ID,
    email: userEmail,
    password: hashedPassword
  };
  console.log(users[user_ID]);
  res.redirect('/urls');
});

 
app.get('/registration', (req, res) => {
  console.log('log rendering registration');
  if (!req.session.user_id) {
    console.log('log check');
    const templateVars = {
      user: req.session.user_id,
    };
    res.render('registration', templateVars);
  } else {
    res.redirect('/urls');
  }
});



//
// LOGIN
//
app.post('/login', (req, res) => {
  console.log('log: client attempting to log in');
  const userEmail = req.body.email;
  const user = getUserByEmail(userEmail, users);
  console.log('log', user);
  console.log('log', typeof user);

  if (user && verifyPassword(user, req.body.password, users)) {
    console.log('log check inside condition');
    req.session.user_id = user;
    res.redirect('/urls');
  }
  // login = true;
  // const user = verifyUserByEmailorPassword(userEmail, users, req.body.password, login);
  // if (!user) {
  //   res.statusCode = 403;
  //   res.send('Error 403. Password or username do not match.');
  //   res.end();
  // }
  res.statusCode = 403;
  res.send('Error 403. Password or username do not match.');
  res.end();
});

app.get('/login', (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render('login', templateVars);
  } else {
    res.redirect('/urls');
  }
});


// clear cookie when clicking logout button, and redirects to home
app.post('/logout', (req, res) => {
  if (req.session.user_id) {
    res.clearCookie("session.sig");
    res.clearCookie("session");
    res.redirect('/urls');
  }
});


// redirecting to specific link outside of tinyapp
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("error. That short URL does not exist.")
    res.end()
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
})


// Error 404
app.get('*', (req, res) => {
  res.send('ERROR 404');
  res.end();
});