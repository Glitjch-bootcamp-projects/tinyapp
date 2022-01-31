# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["The user's homepage before logging in."](https://github.com/glitjch/tinyapp/blob/main/docs/urls-home-page.png?raw=true)

!["The user's homepage after logged in."](https://github.com/glitjch/tinyapp/blob/main/docs/urls-home-logged-in-page.png?raw=true)

!["A new shortened URL created after submitting a regular but long URL"](https://github.com/glitjch/tinyapp/blob/main/docs/new-url-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- Morgan

## Getting Started

- Install all dependencies (using the `npm install` command).
- Replace/Add the following in your package.json file, under "scripts:
    => "start": "./node_modules/.bin/nodemon -L express_server.js",
    => "test": "./node_modules/mocha/bin/mocha"
- Run `npm start` to start the server. This setup automatically detects any changes in your express_server.js. No need to manually restart.
- Run `npm test` to start Mocha and Chai.

- (optional:) Run the development web server using the `node express_server.js` command. Do this if you skipped the second step. 