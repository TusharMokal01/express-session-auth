const { eq } = require("drizzle-orm");
const db = require("../db/index.js")
const { userTable } = require("../models/user.model.js");
const { randomBytes, createHmac } = require("crypto");


const getAllUsers = async function (req, res) {

    /*
    if(!req.user) return res
        .status(403)
        .json({
            Error: `User Not Logged In`
        })
    */

    const fetchAllUsers = await db
        .select({
            firstName: userTable.firstName,
            lastName: userTable.lastName,
            email: userTable.email,
            role: userTable.role
        })
        .from(userTable)

    console.log('Users In DB: ', fetchAllUsers);

    return res
        .status(200)
        .json({
            Users: fetchAllUsers
        })
}

const createUser = async function (req, res) {
    const {firstName, lastName, email, password} = req.body

    if(!firstName || !email || !password) return res
        .status(400)
        .json({
            Error: `Missing Credentials`
        })

    const [existingUser] = await db
        .select({
            email: userTable.email
        })
        .from(userTable)
        .where(eq(userTable.email, email))

    console.log('Existing User: ', existingUser);

    if(existingUser) return res
        .status(409)
        .json({
            Status: 'Conflict',
            Error: `User With, Email: ${email} Already Exist.`
        })

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
            password:hashedPassword,
            salt
        }).returning({
            userId: userTable.id
        })

    return res
        .status(201)
        .json({
            Status: 'Success',
            Message: `User with, User Id: ${newUser.userId} Created Successfully.`
        })
}

module.exports = {
    getAllUsers,
    createUser
}
