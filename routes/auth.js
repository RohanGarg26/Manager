//including packages
const express = require('express')
const { check, body } = require('express-validator')

const router = express.Router()

const Company = require('../model/company')

const authController = require('../controllers/auth')

const isAuthMiddleware = require('../middlewares/isAuth')

router.post('/login-auth', [  //validations
  check('email')
    .isEmail()
    .withMessage('Please enter a valid Email Address.')
    .custom((value, { req }) => {
      return Company.findOne({ email: value })
        .then(company => {
          if (!company) {
            return Promise.reject('This Email is not registered.')
          }
        })
    })
    .trim(),
  body('pass', 'Password is invalid.')
    .isLength({ min: 10, max: 10 })
    .trim()
], authController.loginAuth)

router.get('/login', authController.getLogin)

router.get('/signup', authController.getSignUpForm)
router.post('/signup', [  //vlidations
  check('email')
    .isEmail()
    .withMessage('Please enter a valid Email Address.')
    .custom((value, { req }) => {
      return Company.findOne({ email: value })
        .then(company => {
          if (company) {
            return Promise.reject('This Email already exists. Use a different Email or login.')
          }
        })
    })
    .trim(),
  body(['name', 'address', 'compDesc', 'email'], 'All fields are Required.')
    .not().isEmpty({ ignore_whitespace: true })
], authController.postSignup)

router.post('/logout', isAuthMiddleware.isAuth, authController.logout)

exports.routes = router