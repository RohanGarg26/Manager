const express = require('express')
const router = express.Router()

const adminController = require('../controllers/company-admin')
const authMiddleware = require('../middlewares/isAuth')

router.get('/:compId/member/edit-member/:memberId', authMiddleware.isAuth, adminController.getEditMember)
router.post('/:compId/member/edit-member', authMiddleware.isAuth, adminController.postEditMember)
router.post('/:compId/member/delete/:memberId', authMiddleware.isAuth, adminController.deleteMem)
router.get('/:compId/members/:memberId', authMiddleware.isAuth, adminController.getMemberDetails)
router.get('/:compId/members', authMiddleware.isAuth, adminController.getMember)
router.post('/:compId/add-member', authMiddleware.isAuth, adminController.postAddMember)
router.get('/:compId/add-member', authMiddleware.isAuth, adminController.getAddMember)


router.post('/:compId/team/delete/:teamId', authMiddleware.isAuth, adminController.deleteTeam)
router.get('/:compId/teams/:teamId', authMiddleware.isAuth, adminController.getTeamDetails)
router.get('/:compId/teams', authMiddleware.isAuth, adminController.getTeam)
router.get('/:compId/add-team', authMiddleware.isAuth, adminController.getAddTeam)
router.post('/:compId/add-team', authMiddleware.isAuth, adminController.postAddTeam)


exports.routes = router