//including packages
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const http = require('http')

//importing routes
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/company-admin')
const associateAuthRoutes = require('./routes/associate-auth')
const teamHeadRoutes = require('./routes/team-head')
const teamMemberRoutes = require('./routes/team-member')

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
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flag: 'a' }
)

//for setting headers
app.use(helmet())

//for compressing files
app.use(compression())

//for logging request data
app.use(morgan('combined', { stream: accessLogStream }))

//middleware for parsing request body
app.use(multer({ storage: fileStorage }).single('image'))
app.use(bodyParser.urlencoded({ extended: false }))

//middleware for session
app.use(session({
  secret: `${process.env.sessionSecret}`,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    sameSite: true,
    maxAge: 3600000 * 12
  }
}))

//middleware for csrf
app.use(csrfProtection)

//middleware for serving static files
app.use(express.static(path.join(__dirname)))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

//configure view engine to be ejs
app.set('view engine', 'ejs')
app.set('views', 'views')

//middleware for handling CORS error by allowing to set certain headers
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
app.use('/associate', associateAuthRoutes.routes)

app.use((req, res, next) => { //to set response locals required to toggle company-details
  if (req.session.company) {
    res.locals.company = req.session.company
  }
  next()
})

app.use(adminRoutes.routes)

app.use((req, res, next) => { //to set response locals required to toggle company-details
  if (req.session.member) {
    res.locals.memberId = req.session.member._id
  }
  next()
})

app.use('/associate/team-head', teamHeadRoutes.routes)
app.use('/associate/team-member', teamMemberRoutes.routes)

404
app.use('/', (req, res, next) => {
  if (req.session.DMisLoggedIn) {
    res.status(404)
    res.render('404', { auth: 'true' })
  }
  else {
    res.status(404)
    res.render('404', { auth: 'false' })
  }
})

500
app.use('/', (error, req, res, next) => {
  if (req.session.DMisLoggedIn) {
    console.log(error)
    res.status(500)
    res.render('500', { auth: 'true' })
  }
  else {
    console.log(error)
    res.status(500)
    res.render('500', { auth: 'false' })
  }
})

//connecting to mongoose database
mongoose.connect(`${process.env.mongoString}`, { useNewUrlParser: true })
  .then(result => {
    const server = app.listen(8080)
    let io = require('./utils/socket').init(server)
  })
  .catch(err => {
    console.log(err)
  })