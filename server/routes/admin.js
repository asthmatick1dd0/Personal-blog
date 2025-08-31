const express = require('express');
const router = express.Router();
const Post = require('../models/Post.js');
const User = require('../models/User.js')

const adminLayout = '../views/layouts/admin';



/**
 * GET /admin
 * Admin - login page
 */

router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: 'Admin',
            description: 'Admin Dashboard'
        };
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.error('Error rendering admin login page:', error);
        res.status(500).send('Internal Server Error');
    }
    
});

/**
 * POST /admin
 * Admin - check login credentials
 */

router.post('/admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).send('Invalid username or password');
        }

        req.session.user = user;
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error checking login credentials:', error);
        res.status(500).send('Internal Server Error');
    }
});


/**
 * POST /admin
 * Admin - Register
 */

router.post('/admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).send('Invalid username or password');
        }

        req.session.user = user;
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error checking login credentials:', error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;