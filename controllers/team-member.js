const { validationResult } = require('express-validator')

const Member = require('../model/member')
const Task = require('../model/task')

const io = require('../utils/socket')

exports.getTask = (req, res, next) => {
  Task.find({
    assignedToId: req.session.member._id,
    companyId: req.session.member.companyId
  })
    .then(task => {
      if (req.params.status === 'pending') {
        res.render('team-member/task', {
          path: '/team-member/tasks/pending',
          task: task,
          date: new Date().toISOString().split("T")[0]
        })
      }
      if (req.params.status === 'completed') {
        res.render('team-member/task', {
          path: '/team-member/tasks/completed',
          task: task,
          date: new Date().toISOString().split("T")[0]
        })
      }
    })
}

exports.postCompleteTask = (req, res, next) => {
  Task.updateOne({
    _id: req.body.taskId,
    companyId: req.session.member.companyId,
    assignedToId: req.session.member._id
  }, {
      completed: true,
      dateOfCompletion: Date.now()
    })
    .then(task => {
      let socket = io.getIo()
      socket.emit('tasks',{action: 'complete', assigneeId: req.body.assigneeId})
      res.redirect('/associate/team-member/tasks/completed')
    })
    .catch(err => {
      console.log(err)
    })
}