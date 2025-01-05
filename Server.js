const express = require('express');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3000;
const sql = require('mssql');
const config = require('./services/dbConfig');

// Middleware to parse JSON and handle cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use('/Svg', express.static(__dirname + '/Svg'));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware configuration
app.use(session({
    secret: 'your_secret_key',  // Replace with a strong secret for production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000  // Session expiration time in milliseconds (e.g., 1 day)
    }
}));

app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.set('view engine', 'ejs');

// Custom middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// this is for dev, auto cookie
// app.use((req, res, next) => {
//     req.session.user = {
//         id: 1,
//         username: 'admin',
//         email: 'admin1@example.com',            
//         Role: 1,
//         roleName: 'admin'        
//     };
//     next();
// });


async function checkDbConnection() {
    try {
        await sql.connect(config);
        console.log('Connected to the database successfully!');
    } catch (error) {
        console.log('Can\'t connect to the database: ', error.message);
    }
}

// Use the routes defined in routes.js
app.use('/', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    checkDbConnection();
});
