//including packages
const express = require('express')
const { check, body } = require('express-validator')

const router = express.Router()

const teamMemberController = require('../controllers/team-member')

const memberAuthMiddleware = require('../middlewares/memberIsAuth')

router.get('/tasks/:status',memberAuthMiddleware.memberIsAuth,teamMemberController.getTask)

router.post('/complete-task', memberAuthMiddleware.memberIsAuth, teamMemberController.postCompleteTask)


exports.routes = router