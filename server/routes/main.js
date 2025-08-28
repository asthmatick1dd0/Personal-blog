const express = require('express');
const router = express.Router();

router.get('', (req, res) => {
    const locals = {
        title: "Blog",
        description: "Welcome to my blog"
    }
    res.render('index', locals);
});

router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

module.exports = router;