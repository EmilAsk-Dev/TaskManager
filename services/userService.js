const sql = require('mssql');

const config = {
    user: 'TaskManager',
    password: 'H82po79b',
    server: 'EMIL',
    database: 'UserDatabase',
    options: {
        encrypt: false, // Depending on your server configuration
        trustServerCertificate: true // Depending on your server configuration
    }
};

const authenticateUser = async (username, password) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(`
                SELECT id, username, isAdmin
                FROM Users
                WHERE username = @username AND password = @password
            `);
        
        if (result.recordset.length === 0) {
            throw new Error('Invalid username or password');
        }

        return result.recordset[0];
    } catch (err) {
        console.error('Error authenticating user:', err.message);
        throw err;
    } finally {
        await sql.close();
    }
};

const checkIfUserExists = async (username) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query(`
                SELECT COUNT(*) AS count
                FROM Users
                WHERE username = @username
            `);

        return result.recordset[0].count > 0; // true if user exists, false otherwise
    } catch (err) {
        console.error('Error checking if user exists:', err.message);
        throw err;
    } finally {
        await sql.close();
    }
};

const createUser = async (userData) => {
    try {
        const { username, password, isAdmin } = userData;

        // Check if user already exists
        const userExists = await checkIfUserExists(username);
        if (userExists) {
            return { success: false, message: 'Username already exists' };
        }

        // If user does not exist, proceed with creating new user
        const pool = await sql.connect(config);
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .input('isAdmin', sql.Bit, isAdmin ? 1 : 0)
            .query(`
                INSERT INTO Users (username, password, isAdmin)
                VALUES (@username, @password, @isAdmin)
            `);

        console.log('User created successfully');
        return { success: true, message: 'User created successfully' };
    } catch (err) {
        console.error('Error creating user:', err);
        return { success: false, message: 'Error creating user' };
    } finally {
        await sql.close();
    }
};


module.exports = {
    authenticateUser,
    createUser
};
