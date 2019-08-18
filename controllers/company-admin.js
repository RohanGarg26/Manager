const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcryptjs')
const password = require('secure-random-password')
const fs = require('fs')
const { validationResult } = require('express-validator')

const Member = require('../model/member')
const Team = require('../model/team')
const Company = require('../model/company')

//for configuring mailing service
const transporter = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: `${process.env.sgKey}`
  }
}))

//delete-account 
exports.postDeleteAccount = (req, res, next) => {
  Member.deleteMany({ companyId: req.session.companyId })
    .then(() => {
      return Team.deleteMany({ companyId: req.session.companyId })
    })
    .then(() => {
      let id = new mongoose.Types.ObjectId(req.session.companyId)
      return Company.deleteOne({ _id: id })
    })
    .then(() => {
      res.redirect('/logout')
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}


//members
exports.getMember = (req, res, next) => {
  if (req.query.searchField) {  //if user uses the search bar for finding a member
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
        { companyId: req.session.companyId }
      ]
    }) //counting the documents to display the cards in the template 
      .then(count => {
        if (count == 0) {
          res.render('disp-all-members', { count: count, path: '/members' })
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
              { companyId: req.session.companyId }
            ]
          })
            .then(member => {
              res.render('disp-all-members', { count: count, member: member, path: '/members' })
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
  else {  //if either a get request is made or a new member has been added
    Member.countDocuments({ companyId: req.session.companyId })
      .then(count => {
        if (count == 0) {
          res.render('disp-all-members', { count: count, path: '/members' })
        }
        else {
          Member.find({ companyId: req.session.companyId })
            .then(member => {
              res.render('disp-all-members', { count: count, member: member, path: '/members' })
            })
        }
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
  }
}

//add-member
exports.postAddMember = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    Team.find({ companyId: req.session.companyId }) //finding teams that exist so that they can be selected in the form
      .then(team => {
        return res.status(422).render('add-member', {
          err: errors.array()[0].msg,
          path: '',
          edit: 'false',
          team: team
        })
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
  }
  if (req.body.dob >= new Date().toISOString().split('T')[0]) {
    Team.find({ companyId: req.session.companyId })
      .then(team => {
        return res.status(422).render('add-member', {
          err: 'Invalid date of birth.',
          path: '',
          edit: 'false',
          team: team
        })
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
  }
  else if (req.body.teamHead == 'Yes' && req.body.team != 'Team Not Assigned') { //validation
    Member.findOne({ $and: [{ teamHead: 'Yes' }, { team: req.body.team }, { companyId: req.session.companyId }] })
      .then(member => {
        if (member) {
          Team.find({ companyId: req.session.companyId })
            .then(team => {
              return res.status(422).render('add-member', {
                err: 'The selected team already has a Team Head',
                path: '',
                edit: 'false',
                team: team
              })
            })
            .catch(err => {
              console.log(err)
              next(new Error(err))
            })
        }
      })
  }
  else if (req.body.team == 'Team Not Assigned' && req.body.teamHead == 'Yes') { //validation
    Team.find({ companyId: req.session.companyId })
      .then(team => {
        return res.status(422).render('add-member', {
          err: 'Member cannot be the head of the team that does not exist.',
          path: '',
          edit: 'false',
          team: team
        })
          .catch(err => {
            next(new Error(err))
          })
      })
  }

  let image
  if (req.file) {
    const img = req.file
    image = img.path
  }
  else {
    image = 'images/default-member.png'
  }
  const pass = password.randomPassword({ length: 10, characters: [password.lower, password.upper, password.digits, password.symbols] })
  bcrypt.hash(pass, 12)
    .then(hashedPass => {
      return Promise.all([Team.findOne({
        $and: [
          { team: req.body.team },
          { companyId: req.session.companyId }
        ]
      }), hashedPass])  //finding the teams to be displayed in the views for selection
    })
    .then(([team, hashedPass]) => {
      if (req.body.team != 'Team Not Assigned') {  //if a team was selected in the form
        return new Member({  //creating a new document with details added by the user in the forn
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          dob: req.body.dob,
          address: req.body.address,
          emailId: req.body.emailId,
          imageUrl: image,
          jobTitle: req.body.jobTitle,
          jobDesc: req.body.jobDesc,
          team: req.body.team,
          companyId: req.session.companyId,
          teamId: team._id,
          teamHead: req.body.teamHead,
          password: hashedPass
        }, { versionKey: false }).save()
      }
      else {  //if a team was not selected in the form
        return new Member({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          dob: req.body.dob,
          address: req.body.address,
          emailId: req.body.emailId,
          imageUrl: image,
          jobTitle: req.body.jobTitle,
          jobDesc: req.body.jobDesc,
          team: req.body.team,
          companyId: req.session.companyId,
          teamId: new mongoose.Types.ObjectId('000000000000000000000000'),
          teamHead: 'No',
          password: hashedPass
        }, { versionKey: false }).save()
      }
    })
    .then(member => {
      return transporter.sendMail({
        to: `${req.body.emailId}`,
        from: 'Manager',
        subject: 'Welcome to the Manager',
        html: `
              <body>
              <p>Hello ${ req.body.firstName}</p>
              <p>You've been added to Manager by your company</p>
              <p>
                Your login credentials are: <br>
                Email: ${ req.body.emailId} <br>
                Password: ${ pass} <br>
                   <small>Store your credentials in a safe place.</small>
              </p>
              <p>Have a great experience!!!</p>
              </body>
              `
      })
    })
    .then(() => {
      res.redirect('/members')
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}


//add-member
exports.getAddMember = (req, res, next) => {
  Team.find({ companyId: req.session.companyId }) //finding teams that exist so that they can be selected in the form
    .then(team => {
      res.render('add-member', { team: team, path: ' ', edit: 'false', err: '' })
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}

//member details
exports.getMemberDetails = (req, res, next) => {
  Member.findOne({
    $and: [
      { _id: req.params.memberId },
      { companyId: req.session.companyId }
    ]
  })
    .then(member => {
      return Promise.all([Member.aggregate([  //to get the date from the db in the desired format
        {
          $project: {
            dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } }
          }
        }
      ]), member])
    })
    .then(([d, member]) => {
      res.render('member-detail', { member: member, dob: d[0].dob })
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}


//add-team
exports.postAddTeam = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    return res.status(422).render('add-team', {
      err: errors.array()[0].msg,
      path: ''
    })
  }
  let image
  if (req.file) {
    const img = req.file
    image = img.path
  }
  else {
    image = 'images/default-team.png'
  }
  new Team({
    team: req.body.team,
    teamDesc: req.body.teamDesc,
    imageUrl: image,
    companyId: req.session.companyId,
    teamId: req.body.teamId
  }, { versionKey: false })
    .save()
    .then(team => {
      res.redirect('/teams')
    })
}

//team-details
exports.getTeamDetails = (req, res, next) => {
  Member.countDocuments({
    $and: [
      { teamId: req.params.teamId },
      { companyId: req.session.companyId }
    ]
  })
    .then(count => {
      if (count == 0) {
        res.render('disp-all-members', { count: count, path: '/members' })
      }
      else if (count > 0) {
        Member.find({
          $and: [
            { teamId: req.params.teamId },
            { companyId: req.session.companyId }
          ]
        })
          .then(member => {

            res.render('disp-all-members', { count: count, member: member, path: '/members' })
          })
      }
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}

//add-team
exports.getAddTeam = (req, res, next) => {
  res.render('add-team', { path: ' ', err: '' })
}

//delete-member
exports.deleteMem = (req, res, next) => {
  Member.findOne({
    $and: [
      { _id: req.params.memberId },
      { companyId: req.session.companyId }
    ]
  })
    .then(member => {
      if (member.imageUrl) {
        if (member.imageUrl != 'images/default-member.png') {
          fs.unlink(member.imageUrl, (err) => {
            console.log(err)
            next(new Error(err))
          })
        }
      }
      return Member.deleteOne({
        $and: [
          { _id: req.params.memberId },
          { companyId: req.session.companyId }
        ]
      })
    })
    .then(() => {
      res.redirect('/members')
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}

//delete-team
exports.deleteTeam = (req, res, next) => {
  Member.updateMany(
    {
      $and: [
        { teamId: req.params.teamId },
        { companyId: req.session.companyId }
      ]
    },
    {
      team: 'Team Not Assigned',
      teamHead: 'No',
      teamId: new mongoose.Types.ObjectId('000000000000000000000000')
    }
  )
    .then(() => {
      return Team.findOne({
        $and: [
          { _id: req.params.teamId },
          { companyId: req.session.companyId }
        ]
      })
    })
    .then(team => {
      if (team.imageUrl) {
        if (team.imageUrl != 'images/default-team.png') {
          fs.unlink(team.imageUrl, (err) => {
            console.log(err)
            next(new Error(err))
          })
        }
      }
      return Team.deleteOne({
        $and: [
          { _id: req.params.teamId },
          { companyId: req.session.companyId }
        ]
      })
    })
    .then(() => {
      res.redirect('/teams')
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}

//edit-member
exports.getEditMember = (req, res, next) => {
  Team.find({ companyId: req.session.companyId }) //finding teams that exist so that they can be selected in the form
    .then(team => {
      return Promise.all([Member.findOne({
        $and: [
          { _id: req.params.memberId },
          { companyId: req.session.companyId }
        ]
      }), team])
    })
    .then(([member, team]) => {
      return Promise.all([Member.aggregate([  //to get the date from the db in the desired format
        {
          $project: {
            dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } }
          }
        }
      ]), member, team])
    })
    .then(([date, member, team]) => {
      res.render('add-member', { team: team, path: ' ', edit: 'true', member: member, date: date[0].dob, err: '' })
    })
    .catch(err => {
      console.log(err)
      next(new Error(err))
    })
}

//edit-member
exports.postEditMember = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    Team.find({ companyId: req.session.companyId })
      .then(team => {
        //console.log(req.params.memberId)
        return Promise.all([Member.findOne({
          $and: [
            { _id: req.params.memberId },
            { companyId: req.session.companyId }
          ]
        }), team])
      })
      .then(([member, team]) => {
        return Promise.all([Member.aggregate([
          {
            $project: {
              dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } }
            }
          }
        ]), member, team])
      })
      .then(([date, member, team]) => {
        res.status(422).render('add-member', { team: team, path: ' ', edit: 'true', member: member, date: date[0].dob, err: errors.array()[0].msg })
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
  }
  if (req.body.dob >= new Date().toISOString().split('T')[0]) {
    Team.find({ companyId: req.session.companyId })
      .then(team => {
        //console.log(req.params.memberId)
        return Promise.all([Member.findOne({
          $and: [
            { _id: req.params.memberId },
            { companyId: req.session.companyId }
          ]
        }), team])
      })
      .then(([member, team]) => {
        return Promise.all([Member.aggregate([
          {
            $project: {
              dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } }
            }
          }
        ]), member, team])
      })
      .then(([date, member, team]) => {
        res.status(422).render('add-member', { team: team, path: ' ', edit: 'true', member: member, date: date[0].dob, err: 'Invalid date of birth.' })
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
  }
  else if (req.body.team == 'Team Not Assigned' && req.body.teamHead == 'Yes') {
    Team.find({ companyId: req.session.companyId })
      .then(team => {
        //console.log(req.params.memberId)
        return Promise.all([Member.findOne({
          $and: [
            { _id: req.params.memberId },
            { companyId: req.session.companyId }
          ]
        }), team])
      })
      .then(([member, team]) => {
        return Promise.all([Member.aggregate([
          {
            $project: {
              dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } }
            }
          }
        ]), member, team])
      })
      .then(([date, member, team]) => {
        res.status(422).render('add-member', { team: team, path: ' ', edit: 'true', member: member, date: date[0].dob, err: 'Member cannot be head of a team that does not exists.' })
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
  }
  else if (req.body.teamHead == 'Yes' && req.body.team != 'Team Not Assigned') {
    Member.findOne({ $and: [{ teamHead: 'Yes' }, { team: req.body.team }, { companyId: req.session.companyId }] })
      .then(member => {

        if (member) {
          Team.find({ companyId: req.session.companyId })
            .then(team => {
              //console.log(req.params.memberId)
              return Promise.all([Member.findOne({
                $and: [
                  { _id: req.params.memberId },
                  { companyId: req.session.companyId }
                ]
              }), team])
            })
            .then(([member, team]) => {
              return Promise.all([Member.aggregate([
                {
                  $project: {
                    dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } }
                  }
                }
              ]), member, team])
            })
            .then(([date, member, team]) => {
              res.status(422).render('add-member', { team: team, path: ' ', edit: 'true', member: member, date: date[0].dob, err: 'The selected team already has a Team Head' })
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
  const image = req.file
  let img
  if (image) {
    img = image.path
  }
  else {
    img = 'images/default-member.png'
  }
  if (req.body.team != 'Team Not Assigned') {
    console.log('happy2')
    Member.findById(req.body.memberId)
      .then(member => {
        if (member.imageUrl) {
          if (member.imageUrl != 'images/default-member.png') {
            fs.unlink(String(member.imageUrl), (err) => {
              console.log(err)
              next(new Error(err))
            })
          }
        }
      })
      .then(() => {
        return Team.findOne({
          $and: [
            { team: req.body.team },
            { companyId: req.session.companyId }
          ]
        })
      })
      .then(team => {
        return Member.updateOne(
          { _id: req.body.memberId },
          {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob,
            address: req.body.address,
            emailId: req.body.emailId,
            imageUrl: img,
            jobTitle: req.body.jobTitle,
            jobDesc: req.body.jobDesc,
            team: req.body.team,
            teamId: team._id,
            teamHead: req.body.teamHead
          }
        )
      })
      .then(() => {
        res.redirect('/members')
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })
  }
  else {
    console.log('happy')
    Member.findById(req.body.memberId)
      .then(member => {
        if (member.imageUrl) {
          if (member.imageUrl != 'images/default-member.png') {
            fs.unlink(String(member.imageUrl), (err) => {
              console.log(err)
              next(new Error(err))
            })
          }
        }
      })
      .then(() => {
        return Member.updateOne(
          { _id: req.body.memberId },
          {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob,
            address: req.body.address,
            emailId: req.body.emailId,
            imageUrl: img,
            jobTitle: req.body.jobTitle,
            jobDesc: req.body.jobDesc,
            team: req.body.team,
            teamId: new mongoose.Types.ObjectId('000000000000000000000000'),
            teamHead: req.body.teamHead
          }
        )
      })
      .then(() => {
        res.redirect('/members')
      })
      .catch(err => {
        console.log(err)
        next(new Error(err))
      })

  }
}

//teams
exports.getTeam = (req, res, next) => {
  if (req.query.searchField) {  //if a request is made using the search bar by the user
    const search = req.query.searchField
    Team.find({
      $and: [
        { team: search },
        { companyId: req.session.companyId }
      ]
    }).countDocuments()
      .then(count => {
        if (count == 0) {
          res.render('disp-all-teams', { count: count, path: '/teams' })
        }
        else {
          Team.find({
            $and: [
              { team: search },
              { companyId: req.session.companyId }
            ]
          })
            .then(team => {
              res.render('disp-all-teams', { count: count, team: team, path: '/teams' })
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
  else {
    Team.countDocuments({ companyId: req.session.companyId })
      .then(count => {
        if (count == 0) {
          res.render('disp-all-teams', { count: count, path: '/teams' })
        }
        else {
          Team.find({ companyId: req.session.companyId })
            .then(team => {
              res.render('disp-all-teams', { count: count, team: team, path: '/teams' })
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
}