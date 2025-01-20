const sql = require('mssql');
const config = require('./dbConfig')


// Create user
async function createUser(username, email, passwordHash) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Username', sql.NVarChar, username)
      .input('Email', sql.NVarChar, email)
      .input('PasswordHash', sql.NVarChar, passwordHash)
      .output('UserID', sql.Int)
      .execute('task.usp_CreateUser');
    
    return result.output.UserID; // Returns the generated UserID
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
}

// Authenticate user
async function authenticateUser(usernameOrEmail, passwordHash) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('UsernameOrEmail', sql.NVarChar, usernameOrEmail)
      .input('PasswordHash', sql.NVarChar, passwordHash)
      .execute('task.usp_AuthenticateUser');

    return result.recordset; // Returns authenticated user data
  } catch (err) {
    console.error('Error authenticating user:', err);
    throw err;
  }
}

// Update user
async function updateUser(userID, username, email, passwordHash) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('UserID', sql.Int, userID)
      .input('Username', sql.NVarChar, username || null)
      .input('Email', sql.NVarChar, email || null)
      .input('PasswordHash', sql.NVarChar, passwordHash || null)
      .execute('task.usp_UpdateUser');
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
}

// Delete user
async function deleteUser(userID) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('UserID', sql.Int, userID)
      .execute('task.usp_DeleteUser');
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
}

module.exports = { createUser, authenticateUser, updateUser, deleteUser };
