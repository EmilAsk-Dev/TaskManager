const express = require('express');
const config = require('./services/dbConfig');
const router = express.Router();
const path = require('path');
const authenticate = require('./services/authMiddleware');
const { checkAdmin, checkLoggedin } = require('./services/checkAdmin');
const userService = require('./services/userService');
const { 
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

    
} = require('./services/taskService'); // Include addCategory, readCategories, deleteCategory functions
const fs = require('fs');
const sql = require('mssql');
const { Console } = require('console');

// Middleware to parse JSON and handle cookies
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.join(__dirname, '.', 'public')));

// Route to serve the home page
router.get('/', async (req, res) => {
    // Check if req.session.user exists and if isAdmin is defined, otherwise default to false
    const isAdmin = req.session.user && typeof req.session.user.isAdmin !== 'undefined' ? req.session.user.isAdmin : false;

    // Render the home page with the user and isAdmin values
    res.render('home', { 
        user: req.session.user,
        isAdmin: isAdmin
    });
});



// Route to serve the Login
router.get('/Login', (req, res) => {
    if(req.session.user){
        res.redirect("/Task")
    }    
    res.render('Login', { user: req.session.user });
});

// Route to handle login (authentication middleware added)
router.post('/login', authenticate, (req, res) => {
    res.cookie('authToken', req.session.user.username, { httpOnly: true, secure: false });
    res.status(200).json({ success: true, message: 'Login successful' });
});

// Route to serve the CreateUser page
router.get('/CreateUser', (req, res) => {
    res.sendFile(path.join(__dirname, '.', 'public', 'CreateUser', 'CreateUser.html'));
});

// Route to handle user creation
router.post('/create-user', async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;
        const result = await userService.createUser({ username, password, isAdmin });
        if (result.success) {
            res.status(200).json({ success: true, message: result.message });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/adminPage', checkAdmin, (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    res.render('adminPage', { user: req.session.user });
});

// Route to serve the Task page (requires user to be logged in)
router.get('/Task', checkLoggedin, (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    res.render('Task', { user: req.session.user });
});

// Route to mark a task as completed
router.post('/tasks/:taskId/complete', async (req, res) => {
    const taskId = req.params.taskId;

    try { 
        const result = await markTaskAsCompleted(taskId);
        if (result.success) {
            res.status(200).json({ success: true, message: 'Task marked as completed' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to mark task as completed' });
        }
    } catch (error) {
        console.error('Error marking task as completed:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to fetch tasks for the logged-in user
router.get('/tasks', async (req, res) => {    
    try {
        const username = req.session.user.username;
        const tasks = await readTasks(username);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
});

// Route to fetch highest priority task for the logged-in user
router.get('/highest-prio-task', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).send('User not logged in');
        }

        const username = req.session.user.username;
        const task = await getHighPrioTask(username);
        if (task) {
            res.json(task);
        } else {
            res.status(404).send('No tasks found');
        }
    } catch (error) {
        console.error('Error fetching highest priority task:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch highest priority task' });
    }
});

// Route to serve the AddTask page
router.get('/AddTask', checkLoggedin, (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    
    res.sendFile(path.join(__dirname, '.', 'public', 'AddTask', 'AddTask.html'));
});

// Route to handle task creation
router.post('/add-task', async (req, res) => {
    const taskData = req.body;

    const result = await addTask(taskData, req);
    res.json(result);
});

// Route to remove tasks (newly added)
router.delete('/tasks/:taskId', async (req, res) => {
    const taskId = req.params.taskId;

    try {
        const result = await removeTasks([taskId]);
        if (result.success) {
            res.status(200).json({ success: true, message: 'Task deleted successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to delete task' });
        }
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to handle logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// GET all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await readCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new category
router.post('/categories', async (req, res) => {
    const categoryData = {
        name: req.body.name,
        description: req.body.description,
        created_by: req.session.user.username
    };

    try {
        const newCategory = await addCategory(categoryData);
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a category
router.delete('/categories/:categoryId', async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        deleteCategory(categoryId)
    }
    catch{
        log("cant connect to db")
    }
    
});

router.post('/tasks/:taskId/category', async (req, res) => {
    const taskId = req.params.taskId;
    const { categoryId } = req.body;

    try {
        const result = await assignCategoryToTask(taskId, categoryId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ success: false, message: 'Failed to assign category' });
        }
    } catch (error) {
        console.error('Error assigning category to task:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/categories/:categoryId/tasks', async (req, res) => {
    const categoryId = req.params.categoryId;

    try {
        const tasks = await getTasksByCategory(categoryId);
        if (tasks) {
            res.status(200).json(tasks);
        } else {
            res.status(404).json({ message: 'No tasks found for this category' });
        }
    } catch (error) {
        console.error('Error fetching tasks for category:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
