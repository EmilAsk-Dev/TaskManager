const express = require('express');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const sql = require('mssql');
const config = require('./services/dbConfig');

const app = express();
const port = 3000;

// Middleware to parse JSON and handle cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine (EJS in this case)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session middleware configuration
app.use(session({
    secret: 'your_secret_key',  // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  
        maxAge: 24 * 60 * 60 * 1000  
    }
}));


app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});


async function checkDbConnection() {
    try {
        await sql.connect(config);
        console.log('Connected to the database successfully!');
    } catch (error) {
        console.log('Can\'t connect to the database: ', error.message);
    }
}

// Use the routes defined in routes/index.js
app.use('/', routes);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    checkDbConnection();
});
