const {Router} = require("express");
const User = require("../models/user");
const { createHmac, randomBytes } = require("crypto");

const userRouter = Router();

userRouter.get('/signin', (req, res) => {
    return res.render('signin');
});

userRouter.get('/signup', (req, res) => {
    return res.render('signup');
});

userRouter.post('/signin', async (req, res) => {
    const {email, password} = req.body;
    // Storing the email and password
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        res.cookie("token", token).redirect("/");
        // Trying to verify the password and sending a cookie
    } catch (error) {
        // If the user does not exists or the password is incorrect
        // Then, catch the error redirect to signin page and send an error message
        res.render('signin', {
            error: "Incorrect Email or Password"
        });
    }
});

userRouter.post('/signup', async (req, res) => {
    const {name, email, password} = req.body;
    await User.create({
        name,
        email,
        password,
    });
    res.redirect("/user/signin");
});

userRouter.get('/logout', (re, res) => {
    res.clearCookie("token").redirect("/");
})

module.exports = userRouter;