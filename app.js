//importing modules and packages
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')

//importing routes
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/company-admin')
const memberRoutes = require('./routes/member')
const publicRoutes = require('./routes/public')

const app = express()
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

//middleware for parsing request body
app.use(multer({ storage: fileStorage }).single('image'))
app.use(bodyParser.urlencoded({ extended: false }))

//middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

//configure view engine to be ejs
app.set('view engine', 'ejs')
app.set('views', 'views')

//middleware for CORS error
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATC,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Autharization')
  next()
})

//middlewares for pages 
app.use(authRoutes.routes)
app.use(adminRoutes.routes)
app.use(publicRoutes.routes)

//connecting to mongoose database
mongoose.connect(`${process.env.mongoString}`, { useNewUrlParser: true })
  .then(result => {
    app.listen(8080)
  })
  .catch(err => {
    console.log(err)
  })