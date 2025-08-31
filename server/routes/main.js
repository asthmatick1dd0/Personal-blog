const express = require('express');
const router = express.Router();
const Post = require('../models/Post.js');


/**
 * GET /
 * HOME
 */

router.get('', async (req, res) => {
    try {
        const locals = {
        title: "Blog",
        description: "Welcome to my blog"
        }
        let perPage = 10;
        let page = req.query.page || 1;
        const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
            .skip(perPage * page - perPage)
            .limit(perPage);
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);


        res.render('index', { 
            locals, 
            data, 
            current: page, 
            nextPage: hasNextPage ? nextPage : null 
        });
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


/**
 * GET /
 * Post : id
 */

router.get('/post/:id', async (req, res) => {
    try {
        
        let slug = req.params.id;
        const post = await Post.findById({ _id: slug });
        const locals = {
            title: post.title,
            description: post.description
        }
        if (!post) {
            return res.status(404).send("Post not found");
        }
        res.render('post', { locals, post });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

/**
 * POST /
 * Post - search
 */

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: req.body.searchTerm
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChars), $options: 'i' } },
                { content: { $regex: new RegExp(searchNoSpecialChars), $options: 'i' } }
            ]
        });
        res.render('search', { locals, data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

module.exports = router;