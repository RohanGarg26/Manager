const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')

const Member = require('../model/member')

exports.postAssociateLogin = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    return res.status(422).render('login', {
      errAss: errors.array()[0].msg,
      err: null
    })
  }
  Member.findOne({ emailId: req.body.email })
    .then(member => {
      return Promise.all([bcrypt.compare(req.body.password, member.password), member])
    })
    .then(([match, member]) => {
      if (match) {
        if (member.teamHead == 'Yes') {
          req.session.THisLoggedIn = true;
        }
        else if (member.teamHead == 'No') {
          req.session.TMisLoggedIn = true;
        }
        req.session.member = member;
        req.session.save()
      }
      else {
        return res.render('login', {
          errAss: 'Invalid Password',
          err: null
        })
      }
    })
    .then(session => {
      if (req.session.member.teamHead === 'Yes') {
        return res.redirect('/associate/team-head/team-members')
      }
      else if (req.session.member.teamHead === 'No') {
        return res.redirect('/associate/team-member/tasks/pending')
      }
    })
    .catch(err => {
      next(new Error(err))
    })
}

exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    return res.redirect('/login')
  })
}