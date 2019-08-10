const express = require('express')
const router = express.Router()

const adminController = require('../controllers/company-admin')


router.get('/:compId/members/:memberId',adminController.getMemberDetails)
router.use('/:compId/members',adminController.getPostMember)
router.get('/:compId/teams/:teamId',adminController.getTeamDetails)
router.use('/:compId/teams',adminController.getPostTeam)
router.get('/:compId/add-member',adminController.getAddMember)
router.get('/:compId/add-team',adminController.getAddTeam)


exports.routes = router