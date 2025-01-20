const express = require('express');
const router = express.Router();
const {authenticate} = require('../services/authMiddleware')


router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard'); 
    }
    res.render('Login', { user: null });
});

router.post('/login', authenticate, (req, res) => {
    res.status(200).json({ success: true, message: 'Login successful' });
});


router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during session destruction:', err);
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/auth/login'); 
    });
});

module.exports = router;
