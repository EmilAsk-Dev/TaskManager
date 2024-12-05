const sql = require('mssql');

const config = require("./dbConfig")

const authenticateUser = async (username, password) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .input('Password', sql.NVarChar, password) // Ensure you're passing the hashed password
            .query(`
                EXEC Login @Username = @Username, @Password = @Password
            `);
        
        if (result.recordset.length === 0) {
            throw new Error('Invalid username or password');
        }

        // Return user details
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
            .input('Username', sql.VarChar, username)
            .query(`
                EXEC CheckIfUserExists @Username = @Username
            `);

        return result.recordset[0].UserExists === 1; // true if exists, false otherwise
    } catch (err) {
        console.error('Error checking if user exists:', err.message);
        throw err;
    } finally {
        await sql.close();
    }
};


const createUser = async (userData) => {
    try {
        const { username, password, email, roleID } = userData;

        // Hash the password before inserting
        const hashedPassword = password; // Use bcrypt or other secure hashing methods here

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .input('Password', sql.NVarChar, hashedPassword)
            .input('Email', sql.VarChar, email)
            .input('RoleID', sql.Int, roleID)
            .query(`
                EXEC CreateUser @Username = @Username, @Password = @Password, @Email = @Email, @RoleID = @RoleID
            `);
        
        return result.recordset;
    } catch (err) {
        console.error('Error creating user:', err.message);
        throw err;
    } finally {
        await sql.close();
    }
};


async function getAllUserInfo() {
    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Query to get all user info (username, password, gmail, id, isadmin)
        let result = await pool.request().query('SELECT username, password, id, isadmin FROM Users');
        
        // Initialize an empty array to hold user info objects
        let usersArray = [];

        // Cycle through all the users and push each user's info into the array
        for (let i = 0; i < result.recordset.length; i++) {
            let user = result.recordset[i];
            usersArray.push(user);
        }

        // Log the array of user info (or use it as needed)
        console.log(usersArray);

        // Return the array if needed
        return usersArray;

    } catch (err) {
        console.error('SQL error', err);
    } finally {
        // Close the database connection
        sql.close();
    }
}



module.exports = {
    authenticateUser,
    createUser,
    getAllUserInfo,
    checkIfUserExists
};
