const { eq } = require("drizzle-orm")
const db = require("../db/index.js")
const {userSessions, userTable} = require("../models/user.model.js")
const { randomBytes, createHmac } = require("crypto")

const registerUser = async function (req, res) {
    try {
        // 1. Check if user has provided all the details required to register him/her.
        const {firstName, lastName, email, password} = req.body
        if(!firstName || !email || !password){
            return res
                .status(400)
                .json({
                    Error: `Missing Credentials.`
                })
        }

        // 2. Check if uesr with same 'Email-Id' pre-exist into our database.
        const [existingUser] = await db
            .select({email: userTable.email})
            .from(userTable)
            .where(eq(userTable.email, email))

        console.log("Existing User: ", existingUser);
        
        if(existingUser) return res
            .status(409)
            .json({
                Error: `User With, Email: ${email} Already Exist.`
            })

        console.log("Existing User: ", existingUser);

        // 3. If the user is not an existing user create a new user with provided credentials into data base.

        // As we cannot directly store the user password into the database, So we will hash the password first and store it into the database.
        const salt = randomBytes(16).toString('hex')
        const hashedPassword = createHmac('sha256', salt)
            .update(password)
            .digest('hex')


        const [newUser] = await db
            .insert(userTable)
            .values({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                salt
            }).returning({
                userId: userTable.id
            })

        console.log('New User: ', newUser);

        return res
            .status(201)
            .json({
                Satus: 'Success',
                Message: `User With, User Id: ${newUser.userId} created successfully.`
            })

    } catch (error) {
        return res
            .status(500)
            .json({
                Error: `Internal Server Error.`
            })
    }
}

const userLogin = async function (req, res) {
    try {
        // 1. Check if user has provided all the details required for logging him/her in.
        const {email, password} = req.body

        if(!email || !password){
            return res
                .status(400)
                .json({
                    Error: `Missing Credentials`
                })
        }

        // 2. Checking if the user is an existing user or not. If not throwing relevant error with appropriate status code.
        const [existingUser] = await db
            .select({
                userId: userTable.id,
                email: userTable.email,
                role: userTable.role,
                password: userTable.password,
                salt: userTable.salt
            })
            .from(userTable)
            .where(eq(userTable.email, email))

        console.log('Existing User: ', existingUser);
        
        if(!existingUser){
            return res
                .status(404)
                .json({
                    Error: `User With, Email Id: ${email} Not Found.`
                })
        }

        // 2. If the user is an existing user validating user provided password.
        const validatePassword = createHmac('sha256', existingUser.salt)
            .update(password)
            .digest('hex')

        console.log('EUP: ', existingUser.password);
        console.log('VP: ', validatePassword);

        if(existingUser.password != validatePassword){
            return res
                .status(401)
                .json({
                    Error: `Invalid Password`
                })
        }

        // 3. If the credentials match create session for the user.
        const [userSession] = await db
            .insert(userSessions)
            .values({
                userId: existingUser.userId
            }).returning({
                sessionId: userSessions.id
            })

        console.log('User Session: ', userSession);

        return res
            .status(200)
            .json({
                Status: 'Access Granted',
                Message: `Session Id: ${userSession.sessionId}`
            })
        

    } catch (error) {
        return res
            .status(500)
            .json({
                Error: `Internal Server Error`
            })
    }
}

const userLogout = async function (req, res) {
    if(!req.user) return res
        .status(403)
        .json({
            status: `Access Forbidden`,
            Error: `Invalid Session-Id`
        })

    const sessionId = req.headers['session-id']
    console.log('Sesssion ID: ', sessionId);
    
    const [deleteUserBySessionId] = await db
        .delete(userSessions)
        .where(eq(userSessions.id, sessionId))
        .returning({
            userId: userSessions.userId
        })

    console.log('Deleted User: ', deleteUserBySessionId);

    return res
        .status(200)
        .json({
            Status: `Success`,
            Message: `User With, User Id: ${deleteUserBySessionId.userId} logged out successfully`
        })
}

const getMyDetails = async function (req, res) {
    if(!req.user) return res
        .status(403)
        .json({
            Status: `Acess Forbidden`,
            Error: `Invalid Session-Id`
        })

    const userData = req.user

    return res
        .status(200)
        .json({
            Status: `Data Fetched.`,
            Data: userData
        })
}

module.exports = {
    registerUser,
    userLogin,
    userLogout,
    getMyDetails
}
