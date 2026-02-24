const express = require("express")
const { userRouter } = require("./routes/user.routes.js")
const adminRouter = require("./routes/admin.routes.js")
const {authenticatedUserRouter} = require("./routes/auththenticated.routes.js")

const app = express()
const PORT = process.env.PORT ?? 8000

app.use(express.json())

app.get('/test-route', function(req, res){
    return res
        .status(200)
        .json({
            Status: 'OK',
            Message: `All good app is up and running.`
        })   
})

app.use('/user', userRouter)

app.use('/admin', adminRouter)

app.use('/', authenticatedUserRouter)

app.listen(PORT, function(){
    console.log(`App is running on, PORT: ${PORT}`);
})