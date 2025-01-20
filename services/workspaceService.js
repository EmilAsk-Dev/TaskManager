const sql = require('mssql');
const config = require('./dbConfig');

// Create Workspace
async function createWorkspace(workspaceName, ownerID) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('WorkspaceName', sql.NVarChar, workspaceName)
      .input('OwnerID', sql.Int, ownerID)
      .output('WorkspaceID', sql.Int)
      .execute('task.usp_CreateWorkspace');

    return result.output.WorkspaceID;
  } catch (err) {
    console.error('Error creating workspace:', err);
    throw err;
  }
}

// Update Workspace
async function updateWorkspace(workspaceID, workspaceName, ownerID) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('WorkspaceID', sql.Int, workspaceID)
      .input('WorkspaceName', sql.NVarChar, workspaceName)
      .input('OwnerID', sql.Int, ownerID)
      .execute('task.usp_UpdateWorkspace');
  } catch (err) {
    console.error('Error updating workspace:', err);
    throw err;
  }
}

// Delete Workspace
async function deleteWorkspace(workspaceID, ownerID) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('WorkspaceID', sql.Int, workspaceID)
      .input('OwnerID', sql.Int, ownerID)
      .execute('task.usp_DeleteWorkspace');
  } catch (err) {
    console.error('Error deleting workspace:', err);
    throw err;
  }
}

// Get User Workspaces
async function getUserWorkspaces(userID) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('UserID', sql.Int, userID)
      .execute('task.usp_GetUserWorkspaces');

    return result.recordset; // Return the list of workspaces for the user
  } catch (err) {
    console.error('Error getting user workspaces:', err);
    throw err;
  }
}

module.exports = { createWorkspace, updateWorkspace, deleteWorkspace, getUserWorkspaces };
