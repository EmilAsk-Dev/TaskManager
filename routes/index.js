const express = require('express');
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const workspaceRoutes = require('./workspaceRoutes');
const namespacesRoutes = require('./namespacesRoutes');


const tasksApi = require('./api/tasksRoutes');
const namespacesApi = require('./api/namespacesRoutes');
const {authenticate, isAuth} = require('../services/authMiddleware');

const router = express.Router();



// Mount specific route files
router.use('/auth', authRoutes);         // Routes for login/logout
router.use('/dashboard', dashboardRoutes); // Dashboard-related routes
router.use('/workspace', workspaceRoutes);// Workspace-related routes
router.use('/namespace', namespacesRoutes); 

router.use('/api/v1/tasks', isAuth, tasksApi)
router.use('/api/v1/namespaces', isAuth, namespacesApi)



// Default route (optional, for home)
router.get('/', (req, res) => {
    res.redirect('/auth/login'); // Redirect to login by default
});

module.exports = router;
