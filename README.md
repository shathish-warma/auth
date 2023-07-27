Create a file in the root folder and name it .env.
Create a variable DB_URL and assign the connection string to it:
Create a folder and name it db.
Create a new file in it and name it dbConnect.js.
Next, we'll need to install mongoose:
    ##npm i mongoose -s
In the dbConnect file, require mongoose and env


// CSRF protection using csurf
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(csurf({ cookie: true }));
app.use((request, response, next) => {
  response.locals.csrfToken = request.csrfToken();
  next();
});

// Content Security Policy (CSP) using helmet
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: [],
    mediaSrc: [],
    frameSrc: []
  }