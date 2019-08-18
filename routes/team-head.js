//including packages
const express = require('express')
const { check, body } = require('express-validator')

const router = express.Router()

const teamHeadController = require('../controllers/team-head')

const memberAuthMiddleware = require('../middlewares/memberIsAuth')

router.get('/team-members', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.getTeamMembers)
router.post('/team-members', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.postTeamMembers)

router.get('/all-heads', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.getAllHeads)
router.post('/all-heads', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.postAllHeads)

router.post('/assign-task', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.getAssignTaskForm)
router.post('/create-task', [
  body(['taskTitle', 'taskDesc', 'deadLine'], 'All fields are required.')
    .not().isEmpty({ ignore_whitespace: false })
], memberAuthMiddleware.teamHeadIsAuth, teamHeadController.postAssignTask)

router.get('/view-assigned-tasks/:status', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.getAssignedTasks)

router.get('/my-tasks/:status', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.getMyTasks)

router.post('/dismiss-task', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.postDismissTask)

router.post('/complete-task', memberAuthMiddleware.teamHeadIsAuth, teamHeadController.postCompleteTask)

exports.routes = router