const express = require('express')
const router = express.Router()

const adminController = require('../controllers/company-admin')
const authMiddleware = require('../middlewares/isAuth')

router.get('/:compId/members/:memberId',authMiddleware.isAuth ,adminController.getMemberDetails)
router.use('/:compId/members',authMiddleware.isAuth ,adminController.getPostMember)
router.post('/:compId/member/delete/:memberId',authMiddleware.isAuth ,adminController.deleteMem)

router.get('/:compId/teams/:teamId',authMiddleware.isAuth ,adminController.getTeamDetails)
router.use('/:compId/teams',authMiddleware.isAuth ,adminController.getPostTeam)
router.post('/:compId/team/delete/:teamId',authMiddleware.isAuth ,adminController.deleteTeam)

router.get('/:compId/add-member',authMiddleware.isAuth ,adminController.getAddMember)
router.get('/:compId/add-team',authMiddleware.isAuth ,adminController.getAddTeam)


exports.routes = router