const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        salting: {
            type: String,
        },
        profileImageURL: {
            type: String,
            default: '../public/profileImageDefault.png',
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: "USER",
        }
    },
    {
        timestamp: true,
    }
);

// This function find the user in the database
// If the user is found in the database then 
// We create a token of the user and send it
userSchema.static("matchPasswordAndGenerateToken", async function(email, password) {
    const user = await this.findOne({email});
    if (!user) throw new Error('User not found!');

    const salt = user.salting;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256', salt).update(password).digest("hex");

    if (hashedPassword !== userProvidedHash) {
        throw new Error('Incorrect password!');
    }
    const token = createTokenForUser(user);
    return token;
})

userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest("hex");
    this.salting = salt;
    this.password = hashedPassword;
    next();
});

const User = model('user', userSchema);

module.exports = User;