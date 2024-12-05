const sql = require('mssql');

// SQL Server configuration
const config = {
    user: 'TaskManager_DB',
    password: 'H82po79b',
    server: 'localhost',
    database: 'TaskManager',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = config;

//10.79.1.200