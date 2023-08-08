const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
mongoose.connect(
  `${process.env.DATABASE_USERINFO}`,
  {
    useNewUrlParser: true
  },
  () => {
    console.log('Database connected!')
  }
)
var Schema = mongoose.Schema

var UserSchema = new Schema({
  FullName: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true
  },
  Username: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  }
})

var UserInfo = mongoose.model('UserInfo', UserSchema)
module.exports =  { UserInfo } 
