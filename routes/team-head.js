//including packages
const express = require('express')
const { check, body } = require('express-validator')

const router = express.Router()

const teamHeadController = require('../controllers/team-head')

const memberAuthMiddleware = require('../middlewares/memberIsAuth')

router.get('/team-members',memberAuthMiddleware.memberIsAuth,teamHeadController.getTeamMembers)
router.post('/team-members',memberAuthMiddleware.memberIsAuth,teamHeadController.postTeamMembers)

router.get('/all-heads',memberAuthMiddleware.memberIsAuth,teamHeadController.getAllHeads)
router.post('/all-heads',memberAuthMiddleware.memberIsAuth,teamHeadController.postAllHeads)

exports.routes = router