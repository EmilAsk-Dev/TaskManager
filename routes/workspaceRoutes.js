const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../services/dbConfig');

// Route to fetch details of a specific workspace
router.get('/:workspaceId', async (req, res) => {
    const workspaceId = req.params.workspaceId;

    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('workspaceId', sql.Int, workspaceId)
            .query('SELECT * FROM Workspaces WHERE WorkspaceID = @workspaceId');

        if (result.recordset.length === 0) {
            return res.status(404).send('Workspace not found');
        }

        const workspace = result.recordset[0];

        res.render('Workspace', {
            workspace: workspace,
            user: req.session.user,
        });
    } catch (error) {
        console.error('Error fetching workspace data:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
