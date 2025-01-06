const sql = require('mssql');
const config = require('./dbConfig'); // Your DB configuration file

// Function to get a user by username
async function login(username, password) {
    try {
        const pool = await sql.connect(config); // DB connection
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .execute(`Login`);

        return result.recordset[0]; // Return the first user (or undefined if not found)
    } catch (error) {
        console.error('Error in Login:', error);
        throw error; // Throw error to be handled by the route or middleware
    }
}

module.exports = { login };
