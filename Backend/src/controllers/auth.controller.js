const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel  = require("../models/blacklist.model")

/**
 * @name registerUserController
 * @description Register a new user
 * @access Public
 */

async function registerUserController(req, res){
    const  {username, email, password} = req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message: "All fields are required"
        })
    }

    const isUseralreadyExists = await userModel.findOne({
        $or:[ {username} , {email} ]
    })

    if(isUseralreadyExists){

        /* isUseralreadyExists.username=username */
        return res.status(400).json({
            message: "User already exists"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })


    const token= jwt.sign(
        {userId: user._id, password: user.password},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie("token", token,)

    res.status(201).json({
        message: "User registered successfully",
    })
}


/**
 * @name loginUserController
 * @description Login a user
 * @access Public
 */


async function loginUserController(req, res){

    const {email, password} =req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token= jwt.sign(
        {userId: user._id, password: user.password},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User logged in successfully",
        user: {
            user: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description Logout a user
 * @access Public
 */

async function logoutUserController(req, res){

    const token = req.cookies.token

    if(token){
        await tokenBlacklistModel.create({token})
    }

    res.clearCookie("token")
    res.status(200).json({
        message: "User logged out successfully"
    })
}


/**
 * @name getMeController
 * @description get the current login user details
 * @access private
 */

async function getMeController(req, res){

    const user= await userModel.findById(req.user.userId)

    
    res.status(200).json({
        message: "User details fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}