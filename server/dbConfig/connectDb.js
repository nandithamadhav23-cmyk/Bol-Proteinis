const env = require('dotenv')
const mongoose= require('mongoose')
const connectDb=async()=>
{
    const uri = process.env.MONGODB_URI
   try{
     await mongoose.connect(uri)
     console.log("db connected successfully")
   }
   catch(err)
   {
    console.log(err.message)
   }
}
module.exports=connectDb