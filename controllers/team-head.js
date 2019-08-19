const { validationResult } = require('express-validator')

const Member = require('../model/member')
const Task = require('../model/task')

const io = require('../utils/socket')

exports.getTeamMembers = (req, res, next) => {
  Member.countDocuments({
    $and: [
      { companyId: req.session.member.companyId },
      { teamId: req.session.member.teamId },
      { teamHead: { $ne: req.session.member.teamHead } }
    ]
  })
    .then(count => {
      if (count == 0) {
        return res.render('team-head/disp-team-members', {
          count: count,
          path: 'team-head/team-members'
        })
      }
      else if (count > 0) {
        return Member.find({
          $and: [
            { companyId: req.session.member.companyId },
            { teamId: req.session.member.teamId },
            { teamHead: { $ne: req.session.member.teamHead } }
          ]
        })
          .then(member => {
            return res.render('team-head/disp-team-members', {
              count: count,
              path: 'team-head/team-members',
              member: member
            })
          })
          .catch(err => {
            res.end()
            next(new Error(err))
          })
      }
    })
    .catch(err => {
      res.end()
      next(new Error(err))
    })
}

exports.getAllHeads = (req, res, next) => {
  Member.countDocuments({
    $and: [
      { companyId: req.session.member.companyId },
      { teamId: { $ne: req.session.member.teamId } },
      { teamHead: req.session.member.teamHead }
    ]
  })
    .then(count => {
      if (count == 0) {
        return res.render('team-head/disp-team-members', {
          count: count,
          path: 'team-head/all-heads'
        })
      }
      else if (count > 0) {
        return Member.find({
          $and: [
            { companyId: req.session.member.companyId },
            { teamId: { $ne: req.session.member.teamId } },
            { teamHead: req.session.member.teamHead }
          ]
        })
          .then(member => {
            return res.render('team-head/disp-team-members', {
              count: count,
              path: 'team-head/all-heads',
              member: member
            })
          })
          .catch(err => {
            res.end()
            next(new Error(err))
          })
      }
    })
    .catch(err => {
      res.end()
      next(new Error(err))
    })
}

exports.postTeamMembers = (req, res, next) => {
  const search = req.query.searchField
  const firstN = search.split(' ')[0]
  const lastN = search.split(' ')[1]
  Member.countDocuments({
    $and: [
      {
        $or: [{ firstName: search },
        { lastName: search },
        { jobTitle: search },
        { team: search },
        { $and: [{ firstName: firstN }, { lastName: lastN }] }]
      },
      { teamId: req.session.member.teamId },
      { companyId: req.session.member.companyId },
      { teahHead: { $ne: req.session.member.teamHead } }
    ]
  }) //counting the documents to display the cards in the template 
    .then(count => {
      if (count == 0) {
        return res.render('team-head/disp-team-members', {
          count: count,
          path: 'team-head/team-members',
        })
      }
      else {
        Member.find({
          $and: [
            {
              $or: [{ firstName: search },
              { lastName: search },
              { jobTitle: search },
              { team: search },
              { $and: [{ firstName: firstN }, { lastName: lastN }] }]
            },
            { teamId: req.session.member.teamId },
            { companyId: req.session.member.companyId },
            { teahHead: { $ne: req.session.member.teamHead } }
          ]
        })
          .then(member => {
            return res.render('team-head/disp-team-members', {
              count: count,
              path: 'team-head/team-members',
              member: member
            })
          })
          .catch(err => {
            res.end()
            next(new Error(err))
          })
      }
    })
    .catch(err => {
      res.end()
      next(new Error(err))
    })
}

exports.postAllHeads = (req, res, next) => {
  const search = req.query.searchField
  const firstN = search.split(' ')[0]
  const lastN = search.split(' ')[1]
  Member.countDocuments({
    $and: [
      {
        $or: [{ firstName: search },
        { lastName: search },
        { jobTitle: search },
        { team: search },
        { $and: [{ firstName: firstN }, { lastName: lastN }] }]
      },
      { companyId: req.session.member.companyId },
      { teamId: { $ne: req.session.member.teamId } },
      { teahHead: req.session.member.teamHead }
    ]
  }) //counting the documents to display the cards in the template 
    .then(count => {
      if (count == 0) {
        return res.render('team-head/disp-team-members', {
          count: count,
          path: 'team-head/all-heads',
        })
      }
      else {
        Member.find({
          $and: [
            {
              $or: [{ firstName: search },
              { lastName: search },
              { jobTitle: search },
              { team: search },
              { $and: [{ firstName: firstN }, { lastName: lastN }] }]
            },
            { companyId: req.session.member.companyId },
            { teamId: { $ne: req.session.member.teamId } },
            { teahHead: req.session.member.teamHead }
          ]
        })
          .then(member => {
            return res.render('team-head/disp-team-members', {
              count: count,
              path: 'team-head/all-heads',
              member: member
            })
          })
          .catch(err => {
            res.end()
            next(new Error(err))
          })
      }
    })
    .catch(err => {
      res.end()
      next(new Error(err))
    })
}

exports.getAssignTaskForm = (req, res, next) => {
  return res.render('team-head/assign-task', {
    err: '',
    path: '',
    assignedToId: req.body.assignedToId,
    assignedToName: req.body.assignedToName
  })
}

exports.postAssignTask = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    return res.status(422).render('team-head/assign-task', {
      err: errors.array()[0].msg,
      path: '',
      assignedToId: req.body.assignedToId,
      assignedToName: req.body.assignedToName
    })
  }
  if (req.body.deadLine < new Date().toISOString().split('T')[0]) {
    return res.status(422).render('team-head/assign-task', {
      err: 'Deadline cannot be in the past.',
      path: '',
      assignedToId: req.body.assignedToId,
      assignedToName: req.body.assignedToName
    })
  }
  new Task({
    companyId: req.session.member.companyId,
    assigneeId: req.session.member._id,
    assignedToId: req.body.assignedToId,
    assigneeName: req.session.member.firstName + ' ' + req.session.member.lastName,
    taskTitle: req.body.taskTitle,
    taskDesc: req.body.taskDesc,
    dateOfAssignment: Date.now(),
    deadLine: req.body.deadLine,
    completed: false,
    assignedToName: req.body.assignedToName
  }, { versionKey: false }).save()
    .then(task => {
      let socket = io.getIo()
      socket.emit('tasks',{action: 'create', assignedToId: req.body.assignedToId})
      return res.redirect('/associate/team-head/view-assigned-tasks/pending')
    })
    .catch(err => {
      res.end()
      next(new Error(err))
    })
}

exports.getAssignedTasks = (req, res, next) => {
  Task.find({
    assigneeId: req.session.member._id,
    companyId: req.session.member.companyId
  })
    .then(task => {
      if (req.params.status === 'pending') {
        return res.render('team-head/assigned-tasks', {
          path: '/team-head/view-assigned-tasks/pending',
          task: task,
          date: new Date().toISOString().split("T")[0]
        })
      }
      if (req.params.status === 'completed') {
        return res.render('team-head/assigned-tasks', {
          path: '/team-head/view-assigned-tasks/completed',
          task: task,
          date: new Date().toISOString().split("T")[0]
        })
      }
    })
}

exports.postDismissTask = (req, res, next) => {
  Task.deleteOne({
    _id: req.body.taskId,
    companyId: req.session.member.companyId,
    assigneeId: req.session.member._id
  })
    .then(task => {
      let socket = io.getIo()
      socket.emit('tasks',{action: 'dismiss', assignedToId: req.body.assignedToId})
        return res.redirect('/associate/team-head/view-assigned-tasks/pending')
    })
    .catch(err => {
      res.end()
      next(new Error(err))
    })
}

exports.getMyTasks = (req, res, next) => {
  Task.find({
    assignedToId: req.session.member._id,
    companyId: req.session.member.companyId
  })
    .then(task => {
      if (req.params.status === 'pending') {
        return res.render('team-head/my-tasks', {
          path: '/team-head/my-tasks/pending',
          task: task,
          date: new Date().toISOString().split("T")[0]
        })
      }
      if (req.params.status === 'completed') {
        return res.render('team-head/my-tasks', {
          path: '/team-head/my-tasks/completed',
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
      return res.redirect('/associate/team-head/my-tasks/completed')
    })
    .catch(err => {
      res.end()
      next(new Error(err))
    })
}