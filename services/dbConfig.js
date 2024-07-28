const sql = require('mssql');

// SQL Server configuration
const config = {
    user: 'TaskManager',
    password: 'H82po79b',
    server: 'EMIL',
    database: 'UserDatabase',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = config;