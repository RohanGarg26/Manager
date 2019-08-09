const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcryptjs')
const password = require('secure-random-password')

const Member = require('../model/member')
const Team = require('../model/team')
const Company = require('../model/company')

const transporter = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: `${process.env.sgKey}`
  }
}))

//login-auth
exports.loginAuth = (req, res, next) => {
  res.redirect('/teams')
}

exports.login = (req, res, next) => {
  if (req.method == 'POST') {
    const pass = password.randomPassword({ length: 10, characters: [password.lower, password.upper, password.digits, password.symbols] })
    bcrypt.hash(pass, 12)
      .then(hashedPass => {
        new Company({
          name: req.body.name,
          address: req.body.address,
          compDesc: req.body.compDesc,
          email: req.body.email,
          password: hashedPass
        })
        transporter.sendMail({
          to: 'garg.rohan26@gmail.com',
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
            <p>Have a great experience!!!</p>
            </body>
            `
        })
      })
  }
  res.render('login')
}

exports.getSignUpForm = (req, res, next) => {
  res.render('signup')
}