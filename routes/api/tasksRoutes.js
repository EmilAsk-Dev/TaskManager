const express = require('express');
const sql = require('mssql');
const config = require('../../services/dbConfig');  
const router = express.Router();

//task.usp_GetUserTasks


router.get('/', async (req , res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.UserID;

    try {
        const pool = await sql.connect(config);

        
        const result = await pool.request()
            .input('userId', sql.Int, userId)  
            .execute('task.usp_GetUserTasks');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this user' });
        }

        
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

module.exports = router;