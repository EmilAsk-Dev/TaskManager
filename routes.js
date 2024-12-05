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























/// Middleware to parse JSON request bodies
router.use(express.json());

// Placeholder data: Users, Workspaces, and Tasks
const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

const workspaces = [
    { id: 1, name: 'Workspace A', tasks: [1], users: [1, 2] },
    { id: 2, name: 'Workspace B', tasks: [2, 3], users: [3] },
];

const tasks = [
    { id: 1, title: 'Task 1', description: 'First task', workspaceId: 1, assignedTo: 1 },
    { id: 2, title: 'Task 2', description: 'Second task', workspaceId: 2, assignedTo: 3 },
    { id: 3, title: 'Task 3', description: 'Third task', workspaceId: 2, assignedTo: null },
];

// Simulate database functions
const getUsers = () => users;
const getUserById = (id) => users.find(user => user.id === id);
const getWorkspaces = () => workspaces;
const getWorkspaceById = (id) => workspaces.find(workspace => workspace.id === id);
const getTasksForUser = (userId) => tasks.filter(task => task.assignedTo === userId);
const getTasksForWorkspace = (workspaceId) => tasks.filter(task => task.workspaceId === workspaceId);




router.get('/users', (req, res) => {
    const allUsers = getUsers();
    res.status(200).json(allUsers);
});


router.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const user = getUserById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userTasks = getTasksForUser(userId);
    res.status(200).json({ ...user, tasks: userTasks });
});




router.get('/workspaces', (req, res) => {
    const allWorkspaces = getWorkspaces();
    res.status(200).json(allWorkspaces);
});

router.get('/workspaces/:id', (req, res) => {
    const workspaceId = parseInt(req.params.id, 10);
    const workspace = getWorkspaceById(workspaceId);

    if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
    }

    const workspaceTasks = getTasksForWorkspace(workspaceId);
    res.status(200).json({ ...workspace, tasks: workspaceTasks });
});


router.post('/workspaces', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Workspace name is required' });
    }

    const newWorkspace = {
        id: workspaces.length + 1,
        name,
        tasks: [],
        users: [],
    };

    workspaces.push(newWorkspace);
    res.status(201).json({ message: 'Workspace created', workspace: newWorkspace });
});

router.post('/workspaces/:id/assign', (req, res) => {
    const workspaceId = parseInt(req.params.id, 10);
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const workspace = getWorkspaceById(workspaceId);
    const user = getUserById(userId);

    if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    workspace.users.push(userId);  
    res.status(200).json({ message: 'User assigned to workspace', workspace });
});

router.get('/users/:id/tasks', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const tasksForUser = getTasksForUser(userId);

    if (!tasksForUser) {
        return res.status(404).json({ error: 'No tasks found for this user' });
    }

    res.status(200).json(tasksForUser);
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

router.get("/users", async (req,res) =>{
    try {
        const Users = await userService.getAllUserInfo()
        if(Users) {
            res.status(200).json(Users)            
        } else {
            res.status(404).json({message: 'Cant get the Users'})
        }
    } 
    catch (error){
        console.error('Error fetching tasks for category:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }

})

module.exports = router;
