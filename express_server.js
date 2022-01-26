const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// random id generator
const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(12).substring(1);
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Database here
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// after user logs in their name, use cookie and redirect to home page. display their name
app.post('/login', (req, res) => {
  const name = req.body.username;
  res.cookie("username", name);

  // const requestCookies = req.cookies
  res.redirect('/urls');
});

// delete an entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// updating already existing shortURL with a different longURL
app.post("/urls/:shortURL/update", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  // console.log(urlDatabase);
  res.redirect('/urls');
});


// lead to a page to display the LongUrl after the shortURL is generated
app.post("/urls", (req, res) => {
  const shortURL = generateUid();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// On the url page link to update link page
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});


// redirecting to specific link outside of tinyapp
app.get('/u/:shortURL', (req, res) => {
  const short = req.params.shortURL;  
  const longURL = urlDatabase[short];
  res.redirect(longURL);
})

// redirect to urls because nothing is on root page
app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect('/urls');
});

// main page with the URLs database
app.get("/urls", (req, res) => {
    const templateVars = { 
      urls: urlDatabase,
      username: req.cookies.username
    };
    res.render("urls_index", templateVars);  
});

// create a new entry URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// After generating a new shortURL, display the long url on a new page with the new short URL generation 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], 
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
res.send("<html><body>Hello <b>World</b></body></html>\n");
});

