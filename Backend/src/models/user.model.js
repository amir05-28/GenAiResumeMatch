const mongoose= require("mongoose")



const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:[true, "username already exists"],
        required:[true, "username is required"]
    },
    email:{
        type:String,
        unique:[true, "email already exists"],
        required:[true, "email is required"]
    },
    password:{
        type:String,
        required: true
    }
})


const userModel = mongoose.model("users", userSchema)


module.exports = userModel