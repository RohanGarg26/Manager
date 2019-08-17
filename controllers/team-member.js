const { validationResult } = require('express-validator')

const Member = require('../model/member')
const Task = require('../model/task')

const io = require('../utils/socket')

exports.getTask = (req,res,next) => {
  Task.find({
    assignedToId: req.session.member._id,
    companyId: req.session.member.companyId
  })
  .then(task => {
    if(req.params.status === 'pending'){
    res.render('team-member/task',{
      path: '/team-member/task/pending',
      task: task
    })
  }
    if(req.params.status === 'completed'){
    res.render('team-member/task/completed',{
      path: '/team-member/task/completed',
      task: task
    })
  }
  })
}