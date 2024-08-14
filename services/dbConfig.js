const sql = require('mssql');

// SQL Server configuration
const config = {
    user: 'TaskManager',
    password: 'H82po79b',
    server: 'localhost',
    database: 'UserDatabase',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = config;

//10.79.1.200