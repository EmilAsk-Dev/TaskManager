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

const {
    getAllCategories,
    getCategoryByID,
    addCategory,
    updateCategory,
    deleteCategory,
    GetCategoriesByUser,
    getTasksByCategoryForUser
} = require ('./services/CategoryService')
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
        res.redirect("/Dashboard")
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
router.get('/Dashboard', checkLoggedin, (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    res.render('Dashboard', { user: req.session.user });
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

//get categories
router.get('/categories', async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not logged in' 
            });
        }

        const { filter } = req.query; // Get 'filter' from query string
        const userId = req.session.user.id;
        
        // Get categories for the user
        let categories = await GetCategoriesByUser(userId);
        
        // Apply filter if it exists
        if (filter) {
            categories = categories.filter(category => 
                category.name.toLowerCase().includes(filter.toLowerCase())
            );
        }

        res.json({ 
            success: true, 
            categories 
        });
    } catch (err) {
        console.error('Error fetching categories:', err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching categories' 
        });
    }
});

router.get('/category/:categoryId', async (req, res) => {
    let categoryId, userId; // Declare the variables at the top for global access
    
    try {
        categoryId = req.params.categoryId;  // Get category ID from URL parameter
        userId = req.session.user.id;  // Get user ID from the request (session, JWT, etc.)
    } catch {
        return res.status(500).json({
            success: false,
            message: 'User not Logged in'
        });
    }
    
    try {
        console.log('Fetching tasks for CategoryID:', categoryId, 'and UserID:', userId);
        
        // Fetch tasks based on both categoryId and userId
        const tasks = await getTasksByCategoryForUser(categoryId, userId);
        
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No tasks found for this category.'
            });
        }

        res.json({
            success: true,
            tasks: tasks
        });
    } catch (err) {
        console.error('Error fetching tasks for category:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks for category'
        });
    }
});



// router.get('/tasks/:id/categories', async (req, res) => {
//     const { id } = req.params; // Task ID
//     const userId = req.session.user.id;
//     try {
//         const categories = await GetCategoriesByTask(id, userId);
//         res.json({ success: true, categories });
//     } catch (err) {
//         res.status(500).json({ success: false, message: 'Error fetching categories' });
//     }
// });

// POST a new category
router.post('Tasks/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        const newCategory = await addCategory(name); // Assume this function adds the category to the database
        res.json({ success: true, category: newCategory });
    } catch (err) {
        console.error('Error adding category:', err.message);
        res.status(500).json({ success: false, message: 'Error adding category' });
    }
});

// DELETE a category
router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteCategory(id); // Assume this function deletes the category from the database
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err.message);
        res.status(500).json({ success: false, message: 'Error deleting category' });
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


module.exports = router;
