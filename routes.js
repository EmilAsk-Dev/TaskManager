const express = require('express');
const config = require('./services/dbConfig');
const router = express.Router();
const path = require('path');
const authenticate = require('./services/authMiddleware');
const { checkAdmin, checkLoggedin } = require('./services/checkAdmin');
const userService = require('./services/userService');
const { 
    addTask, 
    markTaskAsCompleted, 
    removeTasks, 
    getTasks,
    unmarkTaskAsCompleted ,
    getSortedTasks
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
    // Check if req.session.user exists, and use a default value for role if not available
    const isAdmin = req.session.user && typeof req.session.user.role !== 'undefined' ? req.session.user.role : false;
    
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

router.post('/tasks/:taskId/unmark', async (req, res) => {
    const taskId = req.params.taskId;
    
    try {
        const result = await unmarkTaskAsCompleted(taskId);
        if (result.success) {
            res.status(200).json({ success: true, message: 'Task unmarked as completed' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to unmark task as completed' });
        }
    } catch (error) {
        console.error('Error unmarking task as completed:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/tasks',async (req, res) => {  
    try {
        
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'User not logged in',
            });
        }

        const userId = req.session.user.id;        
        const tasks = await getTasks(userId);

        res.json({
            success: true,
            tasks: tasks,
            message: 'Tasks fetched successfully',
        });
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
        });
    }
});

router.get('/tasks/sorted', async (req, res) => {
    try {
        const { status, priority, page = 1, pageSize = 10 } = req.query;
        
        // Fetch sorted tasks
        const tasks = await TaskService.getSortedTasks(status, priority, parseInt(page), parseInt(pageSize));

        // Send response with sorted tasks
        res.json({
            success: true,
            tasks: tasks,
            message: 'Sorted tasks fetched successfully',
        });
    } catch (err) {
        console.error('Error fetching sorted tasks:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching sorted tasks',
        });
    }
});

router.get('/checkuser', async (req, res) => {    
    try {
        // Extract the username from the query parameters
        const username = req.query.username;

        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        // Fetch tasks for the specific user using the username
        const tasks = await readTasksWithUsername(username); // Assuming readTasksWithUsername is a function that takes a username as an argument
        
        res.json(tasks); // Send back the tasks as a JSON response
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
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
// POST a new category
// DELETE a category
//Get task for category


module.exports = router;
