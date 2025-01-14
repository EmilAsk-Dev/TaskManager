const express = require('express');
const router = express.Router();

router.get('/' , async (req , res) => {
    res.json(
        [
            { id: 1, name: 'Task 1', status: 'Working on it', date: 'Mar 8', priority: 'High', timeEst: '2h' },
            { id: 2, name: 'Task 2', status: 'Working on it', date: 'Mar 14', priority: 'High', timeEst: '5h' },
            { id: 3, name: 'Task 3', status: 'Waiting for review', date: 'Mar 21', priority: 'Medium', timeEst: '2.5h' },
            { id: 4, name: 'Task 4', status: '', date: 'Mar 29', priority: 'Medium', timeEst: '7h' }
        ]
    )
})

module.exports = router;