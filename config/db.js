const mongoose=require("mongoose");
const connection=mongoose.connect("mongodb+srv://shanuka:shanuka@cluster0.43we5sk.mongodb.net/mywants?retryWrites=true&w=majority");
module.exports={
    connection
}