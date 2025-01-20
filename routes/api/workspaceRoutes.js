const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../../services/dbConfig');  


router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.UserID;

    try {
        const pool = await sql.connect(config);

        
        const result = await pool.request()
            .input('userId', sql.Int, userId)  
            .execute('task.usp_GetUserWorkspaces');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No workspaces found for this user' });
        }

        
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/recent', async (req, res) => {
    res.json([
        { id: "1", name: "Task Board", type: "Main Workspace" },
        { id: "2", name: "Dashboard and Reporting", type: "Main Workspace" },
        { id: "3", name: "Design System", type: "Design Workspace" },
        { id: "4", name: "Task Board", type: "Main Workspace" },
        { id: "5", name: "Dashboard and Reporting", type: "Main Workspace" },
        { id: "6", name: "Design System", type: "Design Workspace" }
    ]);
});


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
