//importing modules and packages
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')

//importing routes
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/company-admin')
const memberRoutes = require('./routes/member')
const publicRoutes = require('./routes/public')

//constants required or various configs
const app = express() //for express
const fileStorage = multer.diskStorage({ //for mongodb
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const store = new mongoDbStore({ //for connect-mongodb-session
  uri: `${process.env.mongoString}`,
  collection: 'sessions'
})
const csrfProtection = csrf()

//middleware for parsing request body
app.use(multer({ storage: fileStorage }).single('image'))
app.use(bodyParser.urlencoded({ extended: false }))

//middleware for session
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    sameSite: true,
    expires: false,
    maxAge: 3600000 * 24
  }
}))

//middleware for csrf
app.use(csrfProtection)

//middleware for flash
app.use(flash())

//middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

//configure view engine to be ejs
app.set('view engine', 'ejs')
app.set('views', 'views')

//middleware for handling CORS error
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATC,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type , Autharization')
  next()
})

//middleware for setting response locals
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  next()
})

//middlewares for routes
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