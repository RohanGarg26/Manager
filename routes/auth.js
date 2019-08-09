const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth')

router.post('/login-auth',authController.loginAuth)
router.use('/login',authController.login)
router.get('/signup',authController.getSignUpForm)

exports.routes = router