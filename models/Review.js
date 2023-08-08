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

var ReviewSchema = new Schema({
  Username: {
    type: String,
    required: true
  },
  ISBN: {
    type: String,
    required: true
  },
  Rating: {
    type: String,
    required: true
  },
  Review: {
    type: String,
    required: false
  }
})

var ReviewDB = mongoose.model('ReviewDB', ReviewSchema)
module.exports = { ReviewDB }
