const express = require('express');
const router = express.Router();

router.get('/' , async (req , res) => {
    res.json([
        { name: "Main", type: "Work management", icon: "M" },
        { name: "Design Projects", type: "Design", icon: "D" }
    ])
})

router.get('/recent', async (req , res) =>{
    res.json([
        {id:"1", name: "Task Board", type: "Main Workspace"},
        {id:"2", name: "Dashboard and Reporting", type: "Main Workspace" },
        {id:"3", name: "Design System", type: "Design Workspace" },
        {id:"4", name: "Task Board", type: "Main Workspace" },
        {id:"5", name: "Dashboard and Reporting", type: "Main Workspace" },
        {id:"6", name: "Design System", type: "Design Workspace" }])
})

module.exports = router;