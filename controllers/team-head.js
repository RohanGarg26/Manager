const { validationResult } = require('express-validator')

const Member = require('../model/member')

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