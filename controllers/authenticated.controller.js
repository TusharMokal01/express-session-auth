const { eq } = require("drizzle-orm");
const db = require("../db/index.js");
const { userTable } = require("../models/user.model");


const getUserProfile = async function (req, res, next) {
    const {userId} = req.body
    console.log('User Id: ', userId);

    if(!userId) return res
        .status(400)
        .json({
            Error: `Missing Credentials`
        })

    const [userProfile] = await db
        .select({
            firstName: userTable.firstName,
            lastName: userTable.lastName,
            email: userTable.email,
            role: userTable.role
        })
        .from(userTable)
        .where(eq(userTable.id, userId))

        if(userProfile.role == 'ADMIN') return res
            .status(403)
            .json({
                Status: 'Access Forbidden',
                Error: `You Are Not Allowed To Access 'Admin Profiles'`
            })

    console.log('User Profile: ', userProfile);

    return res
        .status(200)
        .json({
            userProfile: userProfile
        })
    
}

module.exports = getUserProfile