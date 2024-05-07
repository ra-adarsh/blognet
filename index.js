require('dotenv').config()

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const Blog = require('./models/blog');

const userRouter = require('./routes/user');
const checkForAuthenticationCookie = require('./middlewares/authentication');
const blogRouter = require('./routes/blog');

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URL).then(console.log('Connected to MongoDB'));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/user', userRouter);
app.use(checkForAuthenticationCookie("token"));
app.use('/blog', blogRouter);
app.use(express.static(path.resolve('./')));

// Rendering the homepage
app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
})

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));

