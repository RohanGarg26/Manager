const express = require('express')
const {check} = require('express-validator')

const router = express.Router()

const authController = require('../controllers/auth')

router.post('/login-auth',authController.loginAuth)
router.use('/login',authController.login)
router.use('/logout',authController.logout)
router.get('/signup',authController.getSignUpForm)

exports.routes = router