const { Router } = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const multer = require('multer');
const path = require('path');

const blogRouter = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('./uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

const upload = multer({ storage: storage })

blogRouter.get("/add-new", (req, res) => {
    return res.render('addBlog', {
        user: req.user,
    });
})

blogRouter.post("/", upload.single('coverImage'), async (req, res) => {
    const {title, body} = req.body;
    const blog = await Blog.create({
        title,
        body,
        coverImageURL: `uploads/${req.file.filename}`,
        createdBy: req.user._id,
    });
    return res.redirect("/");
})

blogRouter.get("/:id", async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    const comments = await Comment.find({blogID: req.params.id}).populate('createdBy');
    console.log(comments);
    res.render('blog', {
        user: req.user,
        blog,
        comments,
    });
})

blogRouter.post("/comment/:blogID", async (req, res) => {
    try {
        await Comment.create({
            comment: req.body.content,
            blogID: req.params.blogID,
            createdBy: req.user._id,
        })
    } catch (error) {}
    return res.redirect(`/blog/${req.params.blogID}`);
})

module.exports = blogRouter;
