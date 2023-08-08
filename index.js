const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const ejs = require('ejs')
const app = express()
const bcrypt = require('bcrypt')
const PORT = process.env.PORT || 5000
//importing models here;
const { UserInfo } = require('./models/User')
const { BookInfo } = require('./models/bookInfo')
const { ReviewDB } = require('./models/Review')
const { newBookInfo } = require('./models/newBookmodal')
//importing models ends here;
const { cookie } = require('express/lib/response')
const req = require('express/lib/request')
app.set('view engine', 'ejs')
// const JsonBookData=require('./public/general.json')
//add app.use here
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(cookieParser())
app.use(express.static('public'))
//app.use ends here;
//get requests;
var count = 1
// var bookStartIndex = 0
app.get('/', (req, res) => {
  const { cookies } = req
  newBookInfo
    .find()
    .sort({ Rating: -1 })
    .limit(13)
    .then(data => {
      if (cookies.UserInfo)
        res.render('home', {
          Username: cookies.UserInfo,
          message: `Welcome ${cookies.UserInfo}!`,
          count: count++,
          Books: [data]
        })
      else
        res.render('home', {
          Username: null,
          message: 'Please login or signup !',
          Books: [data],
          count: count++
        })
    })
})

app.get('/about', (req, res) => {
  const { cookies } = req
  res.render('about', { Username: cookies.UserInfo })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/logout', (req, res) => {
  const { cookies } = req
  res.clearCookie(cookie.UserInfo)
  res.redirect('/')
})

app.get('/category', (req, res) => {
  const { cookies } = req
  if (cookies.UserInfo)
    res.render('category', {
      Username: cookies.UserInfo
    })
  else
    res.render('category', {
      Username: null
    })
})

app.get('/books:category', (req, res) => {
  const categorySelected = req.params['category'].replace(':', '')
  const { cookies } = req
  if (categorySelected === 'general') {
    newBookInfo
      .find()
      .sort({ Rating: -1 })
      // .skip(bookStartIndex)
      // .limit(bookStartIndex + 60)
      .then(data => {
        // bookStartIndex = bookStartIndex + 60
        if (cookies.UserInfo)
          res.render('books', {
            Username: cookies.UserInfo,
            Books: data,
            Category: categorySelected
          })
        else
          res.render('books', {
            Username: null,
            Books: data,
            Category: categorySelected
          })
      })
  } else {
    newBookInfo
      .find({
        Category: categorySelected
      })
      .sort({ Rating: -1 })
      // .skip(bookStartIndex)
      // .limit(bookStartIndex + 60)
      .then(data => {
        // bookStartIndex = bookStartIndex + 60
        if (cookies.UserInfo)
          res.render('books', {
            Username: cookies.UserInfo,
            Books: data,
            Category: categorySelected
          })
        else
          res.render('books', {
            Username: null,
            Books: data,
            Category: categorySelected
          })
      })
  }
})

app.get('/book:ISBN', (req, res) => {
  const isbn = req.params['ISBN'].replace(':', '')
  const { cookies } = req
  newBookInfo
    .findOne({
      ISBN: isbn
    })
    .then(data => {
      ReviewDB.find({
        ISBN: isbn
      }).then(review => {
        if (review) {
          if ('UserInfo' in cookies) {
            res.render('book', {
              Username: cookies.UserInfo,
              Title: data.Title,
              Author: data.Author,
              Rating: data.Rating,
              ISBN: data.ISBN,
              Image: data.Image,
              Reviews: review,
              Description: data.Description
            })
          } else {
            res.render('book', {
              Username: null,
              Title: data.Title,
              Author: data.Author,
              Rating: data.Rating,
              ISBN: data.ISBN,
              Image: data.Image,
              Reviews: review,
              Description: data.Description
            })
          }
        } else {
          if ('UserInfo' in cookies) {
            res.render('book', {
              Username: cookies.UserInfo,
              Title: data.Title,
              Author: data.Author,
              Rating: data.Rating,
              ISBN: data.ISBN,
              Image: data.Image,
              Reviews: null,
              Description: data.Description
            })
          } else {
            res.render('book', {
              Username: null,
              Title: data.Title,
              Author: data.Author,
              Rating: data.Rating,
              ISBN: review.ISBN,
              Image: data.Image,
              Reviews: null,
              Description: data.Description
            })
          }
        }
      })
    })
  // if ('UserInfo' in cookies) res.render('book', { Username: cookies.UserInfo })
  // else {
  //   res.render('book', { Username: null })
  // }
})
//this get function is for uploading the books;
app.get('/upload', (req, res) => {
  res.render('book-upload')
})
//post requests;

app.post('/upload', (req, res) => {
  var rating = +req.body.rating
  if (rating > 5) rating = 5
  if (rating < 1) rating = 1
  const newBook = new newBookInfo({
    Title: req.body.title,
    ISBN: req.body.ISBN,
    Image: req.body.url,
    Author: req.body.author,
    Rating: rating,
    Category: req.body.category,
    Description: req.body.desc
  })
  newBook
    .save()
    .then(data => {
      res.redirect('/upload')
    })
    .catch(error => {
      res.json(error)
    })
})

app.post('/search-result', (req, res) => {
  const { cookies } = req
  count = 1
  bookStartIndex = 0
  var keyword = req.body.keyword
  newBookInfo
    .find({ Title: { $regex: `.*${keyword}.*`, $options: 'i' } })
    .sort({ Rating: -1 })
    .then(data => {
      if (cookies.UserInfo)
        res.render('books', {
          Username: cookies.UserInfo,
          Books: data,
          Category: null
        })
      else
        res.render('books', {
          Username: null,
          Books: data,
          Category: null
        })
    })
})

app.post('/logout', (req, res) => {
  res.clearCookie('UserInfo')
  res.redirect('/')
  count = 1
  bookStartIndex = 0
})

app.post('/signUp', (req, res) => {
  const FullName = req.body.FullName
  const Username = req.body.Username
  const Email = req.body.Email
  const Password = req.body.Password
  const salt = bcrypt.genSaltSync(+process.env.SALT)
  const hashedPassword = bcrypt.hashSync(Password, salt)
  const signedUpUser = new UserInfo({
    FullName: req.body.FullName,
    Username: req.body.Username,
    Email: req.body.Email,
    Password: hashedPassword
  })
  signedUpUser
    .save()
    .then(data => {
      res.clearCookie('Userinfo')
      res.cookie('UserInfo', [data.Username])
      count = 1
      res.redirect('/')
    })
    .catch(error => {
      res.json(error)
    })
})

app.post('/login', (req, res) => {
  const Username = req.body.Username
  const Password = req.body.Password
  UserInfo.findOne(
    {
      Username: {
        $eq: Username
      }
    },
    function (err, User) {
      if (err) return handleError(err)
      if (!User) {
        newBookInfo
          .find()
          .sort({ Rating: -1 })
          .limit(13)
          .then(data => {
            res.render('home', {
              message: 'User not found!',
              Username: null,
              Books: [data],
              count: 1
            })
          })
      } else {
        bcrypt.compare(Password, User.Password, function (err, response) {
          if (response) {
            res.clearCookie('UserInfo')
            res.cookie('UserInfo', [User.Username])
            count = 1
            res.redirect('/')
          } else {
            res.redirect('/')
          }
        })
      }
    }
  )
})

app.post('/review:ISBN', async (req, res) => {
  const { cookies } = req
  const ISBN = req.params['ISBN'].replace(':', '')
  const Username = cookies.UserInfo[0]
  const Rating = req.body.Rating
  const Review = req.body.Review
  const newReview = new ReviewDB({
    ISBN: ISBN,
    Username: Username,
    Rating: Rating,
    Review: Review
  })
  var newRating = 0
  var countReviews = 1
  countReviews += await ReviewDB.find({ ISBN: ISBN }).count()
  try {
    await newBookInfo.findOne({ ISBN: ISBN }).then(data => {
      newRating = ((+data.Rating) * countReviews + (+Rating)) / (countReviews + 1)
    })
    await newBookInfo.updateOne({ ISBN: ISBN }, { $set: { Rating: newRating } })
    await newReview.save().then(data => {
      res.redirect(`/book:${ISBN}`)
    })
  } catch (err) {
    console.log(err)
  }
})
//post request to upload any book;
// app.post('/justdoit', (req, res) => {
//   JsonBookData.map((book)=>{
//     const newBook= new BookInfo({
//       Title:book.title,
//       Author:book.authors,
//       ISBN:book.isbn13,
//       Rating:book.average_rating,
//       Image:`https://covers.openlibrary.org/b/isbn/${book.isbn13}-L.jpg`,
//       Category:"general"
//     })
//     newBook.save();
//   })
// })

//port;
app.listen(PORT, () => console.log(`Listening on ${PORT}`))
