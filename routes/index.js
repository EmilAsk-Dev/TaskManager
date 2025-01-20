const express = require('express');
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const workspaceApi = require('./api/workspaceRoutes');
// const namespacesRoutes = require('./api/namespacesRoutes');




const tasksApi = require('./api/tasksRoutes');

const {authenticate, isAuth} = require('../services/authMiddleware');

const router = express.Router();



// Mount specific route files
router.use('/auth', authRoutes);  // Routes for login/logout
router.use('/dashboard', dashboardRoutes);  // Dashboard-related routes
// router.use('/namespace', namespacesRoutes);

//Api's
router.use('/api/v1/tasks', isAuth, tasksApi)
router.use('/api/v1/workspace', isAuth, workspaceApi)



// Default route (optional, for home)
router.get('/', (req, res) => {
    res.redirect('/auth/login'); // Redirect to login by default
});

module.exports = router;
