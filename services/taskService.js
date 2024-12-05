const sql = require('mssql');
const config = require('./dbConfig');

// Function to add a new task
// Function to add a new task
const addTask = async (taskData, req) => {
    try {
        if (!req.session.user) throw new Error('User is not logged in');

        const { name, description, priority, dueDate } = taskData;
        const userId = req.session.user.UserID;

        const pool = await sql.connect(config);
        await pool.request()
            .input('TaskName', sql.VarChar, name)
            .input('Description', sql.Text, description)
            .input('Priority', sql.Int, priority)
            .input('Status', sql.VarChar, 'Pending')  
            .input('UserID', sql.Int, userId)
            .input('DueDate', sql.Date, dueDate)
            .execute('AddTask'); 

        return { success: true, message: 'Task added successfully' };
    } catch (err) {
        console.error('Error adding task:', err.message);
        return { success: false, message: 'Error adding task' };
    } finally {
        await sql.close();
    }
};

// Function to remove tasks
const removeTasks = async (taskIds) => {
    try {
        const taskIdString = taskIds.join(','); // Convert array to comma-separated string

        const pool = await sql.connect(config);
        await pool.request()
            .input('TaskIDs', sql.NVarChar, taskIdString)
            .execute('RemoveTasks'); // Call the stored procedure

        return { success: true, message: 'Tasks removed successfully' };
    } catch (err) {
        console.error('Error removing tasks:', err.message);
        return { success: false, message: 'Error removing tasks' };
    } finally {
        await sql.close();
    }
};

// Fetch sorted tasks (this will be used in the route)



// Function to mark a task as completed
const markTaskAsCompleted = async (taskId) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('TaskID', sql.Int, taskId)
            .execute('MarkTaskAsCompleted'); // Call the stored procedure

        return { success: true, message: 'Task marked as completed successfully' };
    } catch (err) {
        console.error('Error marking task as completed:', err.message);
        return { success: false, message: 'Error marking task as completed' };
    } finally {
        await sql.close();
    }
};

const unmarkTaskAsCompleted = async (taskId) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('TaskID', sql.Int, taskId)
            .execute('UnmarkTaskAsCompleted'); // Call the stored procedure

        return { success: true, message: 'Task unmarked as completed successfully' };
    } catch (err) {
        console.error('Error unmarking task as completed:', err.message);
        return { success: false, message: 'Error unmarking task as completed' };
    } finally {
        await sql.close();
    }
};

// Fetch sorted tasks from the database
async function getSortedTasks(status = null, priority = null, page = 1, pageSize = 10) {
    try {
        // Establish a connection to the database
        const pool = await sql.connect(config);

        // Execute the stored procedure with optional parameters
        const result = await pool.request()
            .input('Status', sql.VarChar, status)
            .input('Priority', sql.Int, priority)
            .input('PageNumber', sql.Int, page)
            .input('PageSize', sql.Int, pageSize)
            .execute('GetUpcomingTasks');

        return result.recordset; // Return the sorted tasks
    } catch (error) {
        console.error("Error fetching sorted tasks:", error);
        throw new Error("Failed to fetch sorted tasks");
    }
}

// Fetch all tasks (no sorting)
const getTasks = async (userId) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .execute('ReadTasks'); // Execute the stored procedure to get tasks for a user

        return result.recordset; // Return tasks
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('Failed to fetch tasks');
    } finally {
        await sql.close();
    }
};





module.exports = {
    addTask,    
    removeTasks,    
    unmarkTaskAsCompleted,
    markTaskAsCompleted,
    getSortedTasks,
    getTasks
};


