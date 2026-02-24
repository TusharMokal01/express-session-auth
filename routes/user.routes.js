const express = require("express")

const {
    getMyDetails,
    registerUser,
    userLogin,
    userLogout
} = require("../controllers/user.controller.js")

const {authenticateUser} = require("../middlewares/customMiddlewares.js")

const userRouter = express.Router()

// POST: Register User
userRouter.post('/auth/register', authenticateUser, registerUser)

// POST: User Login
userRouter.post('/auth/login', authenticateUser, userLogin)

// POST: User Logout
userRouter.delete('/auth/logout', authenticateUser, userLogout)

// GET: Get My Details
userRouter.get('/auth/me', authenticateUser, getMyDetails)

module.exports = {userRouter}