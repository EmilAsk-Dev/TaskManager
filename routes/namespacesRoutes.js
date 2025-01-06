const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../services/dbConfig');

router.get('/:id', async (req, res) => {
    const params = req.params

    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    res.render('namespace', { user: req.session.user });   
    return
})

module.exports = router