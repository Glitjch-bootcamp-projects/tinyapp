const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const bcryptjs = require("bcryptjs");


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


const verifyUserByEmail = function (email, password) {
  for (const id in users) {
    if (users[id].email === email) {
      const compare = bcrypt.compareSync(password, users[id].password);
      if (compare) {
        return users[id];
      }
      return false;
    }
  }
  return false;
};



const passwordMatches = function (email, password) {
  for (const id in users) {
    if (users[id].email === email && users[id].password === password) {
      return id;
    }
  }
  return false;
};

// Did not use function urlsForUser(id) to return the URLs where the userID is equal to the id of the currently logged-in user. SEE urls_index.ejs ***NOTE01.

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


// lead to a page to display the LongUrl after the shortURL is generated
app.post("/urls", (req, res) => {
  if (req.cookies["user_ID"]) {
    const shortURL = generateUid();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      user_ID: req.cookies['user_ID']
    };
    res.redirect(`/urls/${shortURL}`);
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
    user: users[req.cookies.user_ID],
    user_ID: req.cookies['user_ID'],
  };
  res.render("urls_index", templateVars);
});
//      _______     ______/\______
//      |     |    [ Welcome Home ]
//      |     |     ``````````````
//++++++++++++++++++++++++++++++++++++++++++++++++++


// create a new entry URL
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_ID"]) {
    const templateVars = {
      user: users[req.cookies.user_ID],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


// display the long url on a new page with the new short URL generation 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_ID],
  };
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].user_ID === req.cookies.user_ID) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Error. You do not have permission to access this link. \n");
    res.end();
  }
});


// delete an entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].user_ID === req.cookies.user_ID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send("Error. You do not have permission to delete or modify this link. \n");
    res.end();
  }
});


// update already existing shortURL with a different longURL
app.post("/urls/:shortURL/update", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].user_ID === req.cookies.user_ID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
  } else {
    res.send("Error. You do not have permission to delete or modify this link. \n");
    res.end();
  }
});


// link to edit shortURL page, from home page
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});


// ===================================================
// 
// REGISTRATION
app.post('/register', (req, res) => {
  console.log("New user registered!");
  const userEmail = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const generateID = generateUid();

  if (!userEmail || !hashedPassword) {
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
    password: hashedPassword
  };
  console.log(users[generateID]);
  res.cookie('user_ID', generateID);
  res.redirect('/urls');
});
//
//         
app.get('/registration', (req, res) => {
  if (!req.cookies["user_ID"]) {
    const templateVars = {
      user: users[req.cookies.user_ID],
    };
    res.render('registration', templateVars);
  } else {
    res.redirect('/urls');
  }
});
//===================================================


//
// LOGIN
//
app.post('/login', (req, res) => {
  console.log('log /login');
  const userEmail = req.body.email;
  const user = verifyUserByEmail(userEmail, req.body.password);
  if (!user) {
    res.statusCode = 403;
    res.send('Error 403. Password does not match.');
    res.end();
  }
  res.cookie('user_ID', user.id);
  res.redirect('/urls');
});
//
// 
app.get('/login', (req, res) => {
  if (!req.cookies["user_ID"]) {
    const templateVars = {
      user: users[req.cookies.user_ID],
    };
    res.render('login', templateVars);
  } else {
    res.redirect('/urls');
  }
});


// clear cookie when clicking logout button, and redirects to home
app.post('/logout', (req, res) => {
  res.clearCookie("user_ID");
  res.redirect('/urls');
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