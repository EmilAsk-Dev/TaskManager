const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../services/dbConfig');

// Route to display the dashboard
router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    res.render('Dashboard', { user: req.session.user });

    
    return

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, req.session.user.UserID)
            .query('SELECT * FROM Workspaces WHERE UserID = @userId');

        const workspaces = result.recordset;

        res.render('Dashboard', {
            user: req.session.user,
            workspaces: workspaces,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Server Error');
    }
});



module.exports = router;
