const sql = require('mssql');
const config = require('./dbConfig');

// Create Task
async function createTask(taskName, description, ownerID, dueDate, priorityID, timeEstimateHours, workspaceID, categoryID) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('TaskName', sql.NVarChar, taskName)
      .input('Description', sql.NVarChar, description || null)
      .input('OwnerID', sql.Int, ownerID)
      .input('DueDate', sql.Date, dueDate || null)
      .input('PriorityID', sql.TinyInt, priorityID || 2)
      .input('TimeEstimateHours', sql.Decimal(5, 2), timeEstimateHours || 0)
      .input('WorkspaceID', sql.Int, workspaceID)
      .input('CategoryID', sql.Int, categoryID)
      .output('TaskID', sql.Int)
      .execute('task.usp_CreateTask');

    return result.output.TaskID;
  } catch (err) {
    console.error('Error creating task:', err);
    throw err;
  }
}

// Update Task
async function updateTask(taskID, taskName, description, dueDate, priorityID, timeEstimateHours, categoryID, ownerID) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('TaskID', sql.Int, taskID)
      .input('TaskName', sql.NVarChar, taskName)
      .input('Description', sql.NVarChar, description || null)
      .input('DueDate', sql.Date, dueDate || null)
      .input('PriorityID', sql.TinyInt, priorityID || null)
      .input('TimeEstimateHours', sql.Decimal(5, 2), timeEstimateHours || null)
      .input('CategoryID', sql.Int, categoryID || null)
      .input('OwnerID', sql.Int, ownerID)
      .execute('task.usp_UpdateTask');
  } catch (err) {
    console.error('Error updating task:', err);
    throw err;
  }
}

// Delete Task
async function deleteTask(taskID, ownerID) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('TaskID', sql.Int, taskID)
      .input('OwnerID', sql.Int, ownerID)
      .execute('task.usp_DeleteTask');
  } catch (err) {
    console.error('Error deleting task:', err);
    throw err;
  }
}

// Get User Tasks
async function getUserTasks(userID, workspaceID, categoryID, statusID, priorityID, isFavoriteOnly, startDate, endDate) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('UserID', sql.Int, userID)
      .input('WorkspaceID', sql.Int, workspaceID || null)
      .input('CategoryID', sql.Int, categoryID || null)
      .input('StatusID', sql.TinyInt, statusID || null)
      .input('PriorityID', sql.TinyInt, priorityID || null)
      .input('IsFavoriteOnly', sql.Bit, isFavoriteOnly || 0)
      .input('StartDate', sql.Date, startDate || null)
      .input('EndDate', sql.Date, endDate || null)
      .execute('task.usp_GetUserTasks');

    return result.recordset; // Returns the list of tasks
  } catch (err) {
    console.error('Error getting user tasks:', err);
    throw err;
  }
}

module.exports = { createTask, updateTask, deleteTask, getUserTasks };
