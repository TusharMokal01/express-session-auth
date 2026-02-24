const express = require('express')
const getUserProfile = require('../controllers/authenticated.controller.js')
const {authenticateUser, isAuthenticated} = require('../middlewares/customMiddlewares.js')

const authenticatedUserRouter = express.Router()

// GET, User Profile
authenticatedUserRouter.get('/profile', authenticateUser, isAuthenticated, getUserProfile)

module.exports = {authenticatedUserRouter}