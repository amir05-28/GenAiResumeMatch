require("dotenv").config()
const app = require("./src/App")
const connectToDB = require("./src/config/database")



connectToDB()


app.listen(3000,()=>{
    console.log("Server is running at port 3000")
})