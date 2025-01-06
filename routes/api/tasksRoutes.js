const express = require('express');
const router = express.Router();

router.get('/' , async (req , res) => {
    res.json(

        [
            { name: "Main", type: "Work management", icon: "M" },
            { name: "Design Projects", type: "Design", icon: "D" }
        ]
    )
})

module.exports = router;