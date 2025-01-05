const express = require('express');
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const workspaceRoutes = require('./workspaceRoutes');

const router = express.Router();

// Mount specific route files
router.use('/auth', authRoutes);         // Routes for login/logout
router.use('/dashboard', dashboardRoutes); // Dashboard-related routes
router.use('/workspace', workspaceRoutes); // Workspace-related routes

// Default route (optional, for home)
router.get('/', (req, res) => {
    res.redirect('/auth/login'); // Redirect to login by default
});

module.exports = router;
