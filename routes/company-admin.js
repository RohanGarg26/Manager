const express = require('express')
const router = express.Router()

const adminController = require('../controllers/company-admin')
const authMiddleware = require('../middlewares/isAuth')

router.get('/member/edit-member/:memberId', authMiddleware.isAuth, adminController.getEditMember)
router.post('/member/edit-member', authMiddleware.isAuth, adminController.postEditMember)
router.post('/member/delete/:memberId', authMiddleware.isAuth, adminController.deleteMem)
router.get('/members/:memberId', authMiddleware.isAuth, adminController.getMemberDetails)
router.get('/members', authMiddleware.isAuth, adminController.getMember)
router.post('/add-member', authMiddleware.isAuth, adminController.postAddMember)
router.get('/add-member', authMiddleware.isAuth, adminController.getAddMember)


router.post('/team/delete/:teamId', authMiddleware.isAuth, adminController.deleteTeam)
router.get('/teams/:teamId', authMiddleware.isAuth, adminController.getTeamDetails)
router.get('/teams', authMiddleware.isAuth, adminController.getTeam)
router.get('/add-team', authMiddleware.isAuth, adminController.getAddTeam)
router.post('/add-team', authMiddleware.isAuth, adminController.postAddTeam)

router.post('/delete-account', authMiddleware.isAuth, adminController.postDeleteAccount)


exports.routes = router