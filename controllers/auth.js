const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcryptjs')
const password = require('secure-random-password')
const { validationResult } = require('express-validator')
const emailExistence = require('email-existence')

const Company = require('../model/company')

//To configure mailing service
const transporter = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: `${process.env.sgKey}`
  }
}))

//login-auth
exports.loginAuth = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    return res.status(422).render('login', {
      err: errors.array()[0].msg,
      errAss: null
    })
  }
  Company.findOne({ email: req.body.email })
    .then(company => {
      return Promise.all([bcrypt.compare(req.body.pass, company.password), company])
    })
    .then(([match, company]) => {
      if (match) {
        req.session.DMisLoggedIn = true;
        req.session.companyId = company._id;
        req.session.company = company;
        req.session.save()
      }
      else {
        return res.render('login', {
          err: 'Invalid Password',
          errAss: null
        })
      }
    })
    .then(session => {
      return res.redirect('/teams')
    })
    .catch(err => {
      next(new Error(err))
    })
}

//login
exports.getLogin = (req, res, next) => {
  return res.render('login', {
    err: '',
    errAss: null
  })
}

//logout
exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    return res.redirect('/login')
  })
}

//signup
exports.getSignUpForm = (req, res, next) => {
  return res.render('signup', {
    err: ''
  })
}

//signup
exports.postSignup = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    return res.status(422).render('signup', {
      err: errors.array()[0].msg
    })
  }
  emailExistence.check(req.body.email, (error, response) => {
    if(response === false){
      return res.status(422).render('signup', {
        err: 'This email address does not exist. Plese enter an existing email address.'
      })
    }
    else{
      const pass = password.randomPassword({ length: 10, characters: [password.lower, password.upper, password.digits, password.symbols] })
      bcrypt.hash(pass, 12)
        .then(hashedPass => {
          return new Company({
            name: req.body.name,
            address: req.body.address,
            compDesc: req.body.compDesc,
            email: req.body.email,
            password: hashedPass
          }).save()
        })
        .then(company => {
          return transporter.sendMail({
            to: `${req.body.email}`,
            from: 'Manager',
            subject: 'Welcome to the Manager',
            html: `
                <body>
                <p>Hello ${ req.body.name}</p>
                <p>We are glad that your company is now a part of Manager.</p>
                <p>
                  Your data manager login credentials are: <br>
                  Email: ${ req.body.email} <br>
                  Password: ${ pass} <br>
                     <small>Store your credentials in a safe place.</small>
                </p>
                <p>Visit <a href="https://manager4u.herokuapp.com">Manager</a></p>
                <p>Have a great experience!!!</p>
                </body>
                `
          })
        })
        .then(() => {
          return res.redirect('/login')
        })
        .catch(err => {
          next(new Error(err))
        })
    }
  })
}