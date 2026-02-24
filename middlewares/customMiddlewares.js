const { eq } = require("drizzle-orm");
const db = require("../db/index.js");
const { userSessions, userTable } = require("../models/user.model.js");

const { v4: uuidv4, validate: isUUID } = require('uuid')

/*
// Authenticating User, By Checkig If The 'Session ID' Is Present In `req.headers`
const authenticateUser = async function (req, res, next) {
    try {
        // 1. Grabbing 'session-id' form req.headers
        const sessionId = req.headers['session-id']
        console.log('Session Id: ', sessionId);

        // 2. If the session id is not present calling the next function
        if(!sessionId) return next()

        // 3. If the 'session-id' grabbing the user data
        const [userData] = await db
            .select({
                sessionId: userSessions.id,
                userId: userTable.id,
                firstName: userTable.firstName,
                lastName: userTable.lastName,
                email: userTable.email,
                role: userTable.role
            })
            .from(userSessions)
            .innerJoin(userTable, eq(userSessions.userId, userTable.id)) // Don't user right join.
            .where(eq(userSessions.id, sessionId))

        console.log('User Data: ', userData);
        

        // // If there is no user data fetched that refers to frontend has provided some spoofy session-id
        // if(!userData){ // Still not working the catch block is directly getting executed
        //     return res
        //         .status(403)
        //         .json({
        //             Error: `Invalid Sesssion-ID`
        //         })
        // }
       

        if (!isUUID(sessionId)) {
            return res.status(403).json({ Error: 'Invalid Session-ID' })
        }

        req.user = userData

        next()

    } catch (error) {
        console.error('Auth middleware error:', error)

        return res
            .status(500)
            .json({
                Error: `Internal Server Error!`
            })
    }
}
*/


// Middleware to authenticate users based on session ID
const authenticateUser = async function (req, res, next) {
    try {
        // 1️⃣ Grab the session ID from headers
        const sessionId = req.headers['session-id']

        // 2️⃣ If no session ID, skip authentication
        if (!sessionId || sessionId.trim() === '' || sessionId === 'null' || sessionId === 'undefined') {
            return next()
        }

        // 3️⃣ Validate the session ID format
        // Example: UUID format regex (replace if your ID is INT/BIGINT)
        const isValidUUID = (id) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

        if (!isValidUUID(sessionId)) {
            return res.status(403).json({ Error: 'Invalid Session-ID format' })
        }

        // 4️⃣ Query the database for session + user info
        const [userData] = await db
            .select({
                sessionId: userSessions.id,
                userId: userTable.id,
                firstName: userTable.firstName,
                lastName: userTable.lastName,
                email: userTable.email,
                role: userTable.role
            })
            .from(userSessions)
            .innerJoin(userTable, eq(userSessions.userId, userTable.id))
            .where(eq(userSessions.id, sessionId))

        // 5️⃣ If session does not exist, reject
        if (!userData) {
            return res.status(403).json({ Error: 'Invalid Session-ID' })
        }

        // 6️⃣ Attach user data to the request object
        req.user = userData

        // 7️⃣ Continue to the next middleware/route
        next()
    } catch (error) {
        // Log the real error for debugging
        console.error('Authentication middleware error:', error)

        return res.status(500).json({ Error: 'Internal Server Error' })
    }
}



// Checking If 'Session-Id' Provided By The Frontend Is Valid Or Not
const isAuthenticated = async function (req, res, next) {
    if(!req.user) return res
        .status(403)
        .json({
            Status: `Access Forbidden`,
            Error: `User Not Logged In`
        })
    
    next()
}

const isAuthorized = function (role) {

    return function (req, res, next) {
        console.log('User', req.user);

        /* if (!req.user) return next() */

        if (req.user.role != role) {
            return res.status(401).json({
                Error: 'User Not Authorized.'
            })
        }
        
        next()
    }
}

module.exports = {
    authenticateUser,
    isAuthorized,
    isAuthenticated
}