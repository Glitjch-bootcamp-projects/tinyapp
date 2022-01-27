const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//***********************FUNCTION TOOLS********************************/
const generateUid = function () {
  return Math.floor((1 + Math.random()) * 0x10000).toString(12).substring(1);
};


const emailAlreadyExists = function (email) {
  for (const id in users) {
    if (users[id].email === email) {
      return true;
    }
  }
  return false;
};

//****************************DATABASE*********************************/
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  ooo: {
    id: "ooo",
    email: "t.jamesphan@gmail.com",
    password: "meow"
  }

};
//******************************ROUTES*********************************/

// redirect to urls because nothing is on root page
app.get("/", (req, res) => {
  res.redirect('/urls');
});


// lead to a page to display the LongUrl after the shortURL is generated
app.post("/urls", (req, res) => {
  const shortURL = generateUid();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


//++++++++++++++++++++++++++++++++++++++++++++++++++
//
// MAIN PAGE
// main page with the URLs database
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_ID],
  };
  res.render("urls_index", templateVars);
});
//      _______     ______/\______
//      |     |    [ Welcome Home ]
//      |     |     ``````````````
//++++++++++++++++++++++++++++++++++++++++++++++++++


// create a new entry URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_ID],
  };
  res.render("urls_new", templateVars);
});


// display the long url on a new page with the new short URL generation 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_ID],
  };
  res.render("urls_show", templateVars);
});


// delete an entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


// update already existing shortURL with a different longURL
app.post("/urls/:shortURL/update", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});


// link to update-shortURL page, from home page
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});


// ===================================================
// 
// REGISTRATION
app.post('/register', (req, res) => {
  // console.log("submit register button pushed");
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const generateID = generateUid();

  if (!userEmail || !userPassword) {
    console.log(users);
    res.statusCode = 400;
    res.send("error 400. Invalid email or password");
    res.end();
  }
  if (emailAlreadyExists(userEmail) === true) {
    res.statusCode = 400;
    res.send("error 400. Email already exists.");
    res.end();
  }

  users[generateID] = {
    id: generateID,
    email: userEmail,
    password: userPassword
  };
  // console.log(users[generateID].email);
  res.cookie('user_ID', generateID);
  res.redirect('/urls');
});
//
//         
app.get('/registration', (req, res) => {
  console.log("hello registration");
  const templateVars = {
    user: users[req.cookies.user_ID],
  };
  res.render('registration', templateVars);
});
//===================================================


//
// LOGIN
// after user logs in their name, use cookie and redirect to home page. display their name
app.post('/login', (req, res) => {
  // const name = req.body.username;
  // res.cookie("username", name);
  res.redirect('/login');
});
//
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_ID],
  };
  // const name = req.body.username;
  res.render('login', templateVars);
});


// clear username cookie when clicking logout button, and redirects to home
app.post('/logout', (req, res) => {
  res.clearCookie("user_ID");
  res.redirect('/urls');
});


// redirecting to specific link outside of tinyapp
app.get('/u/:shortURL', (req, res) => {
  const short = req.params.shortURL;
  const longURL = urlDatabase[short];
  res.redirect(longURL);
})


// Error 404
app.get('*', (req, res) => {
  res.send('ERROR 404');
  res.end();
});