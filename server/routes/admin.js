const express = require('express');
const router = express.Router();
const Post = require('../models/Post.js');
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const adminLayout = '../views/layouts/admin';

/**
 * Check login
 */
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};


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
    

    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        
        req.session.user = user;
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error checking login credentials:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * GET /dashboard
 * Admin - Dashboard
 */
router.get('/dashboard', authMiddleware, (req, res) => {
    const locals = {
        title: 'Admin Dashboard',
        description: 'Manage your blog posts'
    };
    res.render('admin/dashboard', { locals, layout: adminLayout });
});

/**
 * POST /admin
 * Admin - Register
 */

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User registered successfully', user });
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 11000) {
                res.status(409).json({ message: 'Username already exists' });
            } else {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error checking login credentials:', error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;