const express = require('express')
const router = express.Router()

const adminController = require('../controllers/company-admin')


router.get('/members/:memberId',adminController.getMemberDetails)
router.use('/members',adminController.getPostMember)
router.get('/teams/:teamId',adminController.getTeamDetails)
router.use('/teams',adminController.getPostTeam)
router.get('/add-member',adminController.getAddMember)
router.get('/add-team',adminController.getAddTeam)


exports.routes = router