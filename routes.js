const express = require('express');
const config = require('./services/dbConfig');
const router = express.Router();
const path = require('path');
const authenticate = require('./services/authMiddleware');
const { checkAdmin, checkLoggedin } = require('./services/LoginChecks');
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

// Route to serve the login page
router.get('/', async (req, res) => {
    // Check if req.session.user exists, and use a default value for role if not available
    const isAdmin = req.session.user && typeof req.session.user.role !== 'undefined' ? req.session.user.role : false;
    res.render('Login', { user: req.session.user });
});



// Route to serve the Login
router.get('/Login', (req, res) => {
    if(req.session.user){
        res.redirect("/Dashboard")
    }
    res.render('Login', { user: req.session.user });
});

// Route to handle login (authentication middleware added)
router.post('/Login', authenticate, (req, res) => {
    
    res.cookie('authToken', req.session.user.username, { httpOnly: true, secure: false });
    res.status(200).json({ success: true, message: 'Login successful' });  
});

// Route to serve the Task page (requires user to be logged in)
router.get('/Dashboard', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    res.render('Dashboard', { user: req.session.user });
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


router.get('/workspaces/:id/tasks', (req, res) => {
    const workspaceId = parseInt(req.params.id, 10);
    const tasksForWorkspace = getTasksForWorkspace(workspaceId);

    if (!tasksForWorkspace) {
        return res.status(404).json({ error: 'No tasks found for this workspace' });
    }

    res.status(200).json(tasksForWorkspace);
});


router.post('/workspaces/:id/tasks', (req, res) => {
    const workspaceId = parseInt(req.params.id, 10);
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const newTask = {
        id: tasks.length + 1,
        title,
        description,
        workspaceId,
        assignedTo: null,
    };

    tasks.push(newTask);
    res.status(201).json({ message: 'Task created', task: newTask });
});


module.exports = router;
