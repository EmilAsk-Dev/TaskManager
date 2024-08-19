const sql = require('mssql');
const config = require('./dbConfig');

// Function to add a new task
const addTask = async (taskData, req) => {
    try {
        if (!req.session.user) throw new Error('User is not logged in');

        const { name, description, priority, dueDate } = taskData;
        const createdBy = req.session.user.username;

        const pool = await sql.connect(config);
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('description', sql.VarChar, description)
            .input('status', sql.Bit, 0)
            .input('priority', sql.VarChar, priority)
            .input('createdBy', sql.VarChar, createdBy)
            .input('dueDate', sql.VarChar, dueDate)
            .query(`
                INSERT INTO Tasks (name, description, status, priority, createdBy)
                VALUES (@name, @description, @status, @priority, @createdBy, @dueDate)
            `);

        return { success: true, message: 'Task added successfully' };
    } catch (err) {
        console.error('Error adding task:', err.message);
        return { success: false, message: 'Error adding task' };
    } finally {
        await sql.close();
    }
};

// Function to read tasks for a specific user
const readTasks = async (username) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query(`
                SELECT *
                FROM Tasks
                WHERE createdBy = @username
            `);

        return result.recordset;
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        throw err;
    } finally {
        await sql.close();
    }
};

// Function to get the highest priority task for a specific user
const getHighPrioTask = async (username) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query(`
                SELECT TOP 1 *
                FROM Tasks
                WHERE createdBy = @username
                ORDER BY priority DESC
            `);

        return result.recordset[0];
    } catch (err) {
        console.error('Error fetching highest priority task:', err.message);
        throw err;
    } finally {
        await sql.close();
    }
};

// Function to mark a task as completed
const markTaskAsCompleted = async (taskId) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('taskId', sql.Int, taskId)
            .query(`
                UPDATE Tasks
                SET status = 1
                WHERE id = @taskId
            `);

        return { success: true, message: 'Task marked as completed' };
    } catch (err) {
        console.error('Error marking task as completed:', err.message);
        return { success: false, message: 'Error marking task as completed' };
    } finally {
        await sql.close();
    }
};

// Function to remove tasks
const removeTasks = async (taskIds) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .query(`
                DELETE FROM Tasks
                WHERE id IN (${taskIds.map(id => `'${id}'`).join(',')})
            `);

        return { success: true, message: 'Tasks removed successfully' };
    } catch (err) {
        console.error('Error removing tasks:', err.message);
        return { success: false, message: 'Error removing tasks' };
    } finally {
        await sql.close();
    }
};

// Function to add a new category
const addCategory = async (categoryData) => {
    try {
        const { name, description, created_by } = categoryData;

        const pool = await sql.connect(config);
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('description', sql.VarChar, description)
            .input('created_by', sql.VarChar, created_by)
            .query(`
                INSERT INTO Categories (name, description, created_by)
                VALUES (@name, @description, @created_by)
            `);

        return { success: true, message: 'Category added successfully' };
    } catch (err) {
        console.error('Error adding category:', err.message);
        return { success: false, message: 'Error adding category' };
    } finally {
        await sql.close();
    }
};

// Function to read all categories
const readCategories = async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT *
            FROM Categories
        `);

        return result.recordset;
    } catch (err) {
        console.error('Error fetching categories:', err.message);
        throw err;
    } finally {
        await sql.close();
    }
};

// Function to delete a category
const deleteCategory = async (categoryId) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('categoryId', sql.Int, categoryId)
            .query(`
                DELETE FROM Categories
                WHERE id = @categoryId
            `);

        return { success: true, message: 'Category deleted successfully' };
    } catch (err) {
        console.error('Error deleting category:', err.message);
        return { success: false, message: 'Error deleting category' };
    } finally {
        await sql.close();
    }
};

const assignCategoryToTask = async (taskId, categoryId) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('taskId', sql.Int, taskId)
            .input('categoryId', sql.Int, categoryId)
            .query(`
                UPDATE Tasks
                SET categoryId = @categoryId
                WHERE id = @taskId
            `);

        return { success: true, message: 'Category assigned to task successfully' };
    } catch (err) {
        console.error('Error assigning category to task:', err.message);
        return { success: false, message: 'Error assigning category to task' };
    } finally {
        await sql.close();
    }
};

async function getTasksByCategory(categoryId) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('categoryId', sql.Int, categoryId)
            .query('SELECT * FROM Tasks WHERE categoryId = @categoryId');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching tasks by category:', err.message);
        throw err;
    }
}



module.exports = {
    addTask,
    readTasks,
    getHighPrioTask,
    markTaskAsCompleted,
    removeTasks,
    addCategory,
    readCategories,
    deleteCategory,
    assignCategoryToTask,
    getTasksByCategory
};


