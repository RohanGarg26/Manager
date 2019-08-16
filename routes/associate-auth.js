//including packages
const express = require('express')
const { check, body } = require('express-validator')

const router = express.Router()

const Member = require('../model/member')

const associateAuthController = require('../controllers/associate-auth')

const memberAuthMiddleware = require('../middlewares/memberIsAuth')

router.post('/login',[  //validations
  check('email')
    .isEmail()
    .withMessage('Please enter a valid Email Address.')
    .custom((value, { req }) => {
      return Member.findOne({ emailId: value })
        .then(member => {
          if (!member) {
            return Promise.reject('This Email is not registered.')
          }
        })
    })
    .trim(),
  body('password', 'Password is invalid.')
    .isLength({ min: 10, max: 10 })
    .trim()
],associateAuthController.postAssociateLogin)

router.post('/logout',memberAuthMiddleware.memberIsAuth,associateAuthController.logout)

exports.routes = router