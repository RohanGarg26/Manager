const { validationResult } = require('express-validator')

const Member = require('../model/member')
const Task = require('../model/task')

const io = require('../utils/socket')
const ioClient = require('socket.io-client')

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
        res.render('team-head/disp-team-members', {
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
            res.render('team-head/disp-team-members', {
              count: count,
              path: 'team-head/team-members',
              member: member
            })
          })
          .catch(err => {
            console.log(err)
            next(new Error(err))
          })
      }
    })
    .catch(err => {
      console.log(err)
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
        res.render('team-head/disp-team-members', {
          count: count,
          path: 'team-head/all-heads'
        })
      }
      else if (count > 0) {
        return Member.find({
          $and: [
            { companyId: req.session.member.companyId },
            { teamId: { $ne: req.session.member.teamId } },
            { teamHead: req.session.member.teamHead  }
          ]
        })
          .then(member => {
            res.render('team-head/disp-team-members', {
              count: count,
              path: 'team-head/all-heads',
              member: member
            })
          })
          .catch(err => {
            console.log(err)
            next(new Error(err))
          })
      }
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}

exports.postTeamMembers = (req,res,next) => {
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
        { teamId: req.session.member.teamId  },
        { companyId: req.session.member.companyId },
        {teahHead: {$ne: req.session.member.teamHead}}
      ]
    }) //counting the documents to display the cards in the template 
      .then(count => {
        if (count == 0) {
          res.render('team-head/disp-team-members', {
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
              {teahHead: {$ne: req.session.member.teamHead}}
            ]
          })
            .then(member => {
              res.render('team-head/disp-team-members', {
                count: count,
                path: 'team-head/team-members',
                member: member
              })
            })
            .catch(err => {
              console.log(err)
              next(new Error(err))
            })
        }
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
}

exports.postAllHeads = (req,res,next) => {
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
        {teahHead: req.session.member.teamHead}
      ]
    }) //counting the documents to display the cards in the template 
      .then(count => {
        if (count == 0) {
          res.render('team-head/disp-team-members', {
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
              {teahHead: req.session.member.teamHead}
            ]
          })
            .then(member => {
              res.render('team-head/disp-team-members', {
                count: count,
                path: 'team-head/all-heads',
                member: member
              })
            })
            .catch(err => {
              console.log(err)
              next(new Error(err))
            })
        }
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
}

exports.getAssignTaskForm = (req,res,next) =>{
  res.render('team-head/assign-task',{
    err: '',
    path: '',
    assignedToId: req.body.assignedToId,
    assignedToName: req.body.assignedToName
  })
}

exports.postAssignTask = (req,res,next) => {
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
  new Task({
    companyId: req.session.member.companyId,
    assigneeId: req.session.member._id,
    assignedToId: req.body.assignedToId,
    assigneeName: req.session.member.firstName + ' ' + req.session.member.lastName,
    taskTitle: req.body.taskTitle,
    taskDesc: req.body.taskDesc,
    dateOfAssignment:  Date.now(),
    deadLine: req.body.deadLine,
    completed: false,
    assignedToName: req.body.assignedToName
  },{versionKey: false}).save()
    .then(task => {
      
      res.redirect('/associate/team-head/view-assigned-tasks/pending')
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}

exports.getAssignedTasks = (req,res,next) => {
  Task.find({
    assigneeId: req.session.member._id,
    companyId: req.session.member.companyId
  })
  .then(task => {
    if(req.params.status === 'pending'){
    res.render('team-head/assigned-tasks',{
      path: '/team-head/view-assigned-tasks/pending',
      task: task
    })
  }
    if(req.params.status === 'completed'){
    res.render('team-head/assigned-tasks',{
      path: '/team-head/view-assigned-tasks/completed',
      task: task
    })
  }
  })
}