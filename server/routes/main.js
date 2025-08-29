const express = require('express');
const router = express.Router();
const Post = require('../models/Post.js')


/**
 * GET /
 * HOME
 */

router.get('', async (req, res) => {
    const locals = {
        title: "Blog",
        description: "Welcome to my blog"
    }
    try {
        const data = await Post.find();
        res.render('index', { locals, data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// function insertPostData() {
//     Post.insertMany([
//         {
//             title: "Building a blog with Node.js",
//             content: "In this post, we'll explore how to build a blog using Node.js and Express."
//         }
//     ])
// };

// insertPostData();











router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

module.exports = router;