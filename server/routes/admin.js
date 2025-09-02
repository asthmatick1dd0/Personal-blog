const express = require("express");
const router = express.Router();
const Post = require("../models/Post.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";

/**
 * Check login
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * GET /admin
 * Admin - login page
 */

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Admin Dashboard",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.error("Error rendering admin login page:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /admin
 * Admin - check login credentials
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });

    req.session.user = user;
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error checking login credentials:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET /dashboard
 * Admin - Dashboard
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin Dashboard",
      description: "Manage your blog posts",
    };
    const data = await Post.find();
    res.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {}
});

/**
 * GET /dashboard
 * Admin - Create new post
 */
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Create new post",
      description: "Create a new blog post",
    };
    res.render("admin/add-post", { locals, layout: adminLayout });
  } catch (error) {
    console.error("Error rendering add post page:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /add-post
 * Admin - Create new post
 */
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    console.log(req.body);
    const { title, body } = req.body;
    try {
      const newPost = new Post({ title: title, content: body });
      await Post.create(newPost);
    } catch (error) {
      console.error("Error creating new post:", error);
    }
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error getting data for new post:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * GET /dashboard/edit-post
 * Admin - Edit post
 */
router.get("/edit-post/:_id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit post",
      description: "Edit your post",
    };
    let slug = req.params._id;
    const post = await Post.findById({ _id: slug });

    res.render("admin/edit-post", { locals, post, layout: adminLayout });
  } catch (error) {
    console.error("Error getting data for edit post:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /dashboard/edit-post
 * Admin - Edit post
 */
router.post("/edit-post/:_id", authMiddleware, async (req, res) => {
  try {
    let slug = req.params._id;
    const post = await Post.findById({ _id: slug });
    const { title, content } = req.body;
    post.title = title;
    post.content = content;
    post.updatedAt = Date.now();
    await post.save();
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /admin
 * Admin - Register
 */

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === 11000) {
        res.status(409).json({ message: "Username already exists" });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error checking login credentials:", error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
