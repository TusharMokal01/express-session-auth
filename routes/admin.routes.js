const express = require("express")
const { isAuthorized, authenticateUser, isAuthenticated } = require("../middlewares/customMiddlewares.js")
const {getAllUsers, createUser} = require("../controllers/admin.controllers.js")

const adminRouter = express.Router()

const adminAccessOnly = isAuthorized('ADMIN')

// GET, All Current Loggged In User.
adminRouter.get('/users', authenticateUser, isAuthenticated, adminAccessOnly, getAllUsers)

// POST, Create New User.
adminRouter.post('/create-user', authenticateUser, isAuthenticated, adminAccessOnly, createUser)

module.exports = adminRouter