const express = require('express');
const router = express.Router();

router.get('/', async (req , res) => {
    res.json(   
        [
            { id: 1, name: "Task 1", status: "Working on it", date: "2025-01-16", priority: "High", timeEst: "2h" },
            { id: 2, name: "Task 2", status: "Working on it", date: "2025-01-16", priority: "High", timeEst: "5h" },
            { id: 3, name: "Task 3", status: "Waiting for review", date: "2025-01-29", priority: "Medium", timeEst: "2.5h" },
            { id: 4, name: "Task 4", status: "working atm", date: "2025-01-27", priority: "Medium", timeEst: "7h" },                            
            { id: 5, name: "Task 5", status: "mashalla", date: "2025-01-30", priority: "High", timeEst: "2h" },
            { id: 6, name: "Task 6", status: "plasken", date: "2025-05-23", priority: "High", timeEst: "2h" },
            { id: 7, name: "Task 7", status: "sasken", date: "2026-01-23", priority: "High", timeEst: "2h" }
        ]

    )
})

module.exports = router;