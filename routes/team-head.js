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

router.post('/assign-task',memberAuthMiddleware.memberIsAuth,teamHeadController.getAssignTaskForm)
router.post('/create-task',[
  body(['taskTitle','taskDesc','deadLine'],'All fields are required.')
    .not().isEmpty({ignore_whitespace: false})
],memberAuthMiddleware.memberIsAuth,teamHeadController.postAssignTask)

router.get('/view-assigned-tasks/:status', memberAuthMiddleware.memberIsAuth,teamHeadController.getAssignedTasks)

exports.routes = router