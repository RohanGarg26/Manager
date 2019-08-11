const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcryptjs')
const password = require('secure-random-password')
const fs = require('fs')

const Member = require('../model/member')
const Team = require('../model/team')

const transporter = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: `${process.env.sgKey}`
  }
}))


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
        { companyId: req.params.compId }
      ]
    }) //counting the documents to display the cards in the template 
      .then(count => {
        if (count == 0) {
          res.render('disp-all-members', { count: count, path: '/' + encodeURIComponent(req.params.compId) + '/members', cId: req.params.compId })
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
              { companyId: req.params.compId }
            ]
          })
            .then(member => {
              res.render('disp-all-members', { count: count, member: member, path: '/' + encodeURIComponent(req.params.compId) + '/members', cId: req.params.compId })
            })
            .catch(err => {
              console.log(err)
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
  else {  //if either a get request is made or a new member has been added
    Member.countDocuments({ companyId: req.params.compId })
      .then(count => {
        if (count == 0) {
          res.render('disp-all-members', { count: count, path: '/' + encodeURIComponent(req.params.compId) + '/members', cId: req.params.compId })
        }
        else {
          Member.find({ companyId: req.params.compId })
            .then(member => {
              res.render('disp-all-members', { count: count, member: member, path: '/' + encodeURIComponent(req.params.compId) + '/members', cId: req.params.compId })
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

exports.postAddMember = (req, res, next) => {
  const image = req.file
  const pass = password.randomPassword({ length: 10, characters: [password.lower, password.upper, password.digits, password.symbols] })
  bcrypt.hash(pass, 12)
    .then(hashedPass => {
      return Promise.all([Team.findOne({
        $and: [
          { team: req.body.team },
          { companyId: req.params.compId }
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
          imageUrl: image.path,
          jobTitle: req.body.jobTitle,
          jobDesc: req.body.jobDesc,
          team: req.body.team,
          companyId: req.params.compId,
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
          imageUrl: image.path,
          jobTitle: req.body.jobTitle,
          jobDesc: req.body.jobDesc,
          team: req.body.team,
          companyId: req.params.compId,
          teamId: new mongoose.Types.ObjectId('000000000000000000000000'),
          teamHead: req.body.teamHead,
          password: hashedPass
        }, { versionKey: false }).save()
      }
    })
    .then(member => {
      return transporter.sendMail({
        to: 'garg.rohan26@gmail.com',
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
      res.redirect('/' + encodeURIComponent(req.params.compId) + '/members')
    })
    .catch(err => {
      console.log(err)
    })
}

//add-member
exports.getAddMember = (req, res, next) => {
  Team.find() //finding teams that exist so that they can be selected in the form
    .then(team => {
      res.render('add-member', { team: team, path: ' ', cId: req.params.compId, edit: 'false' })
    })
    .catch(err => {
      console.log(err)
    })
}

//member details
exports.getMemberDetails = (req, res, next) => {
  Member.findOne({
    $and: [
      { _id: req.params.memberId },
      { companyId: req.params.compId }
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
      res.render('member-detail', { member: member, dob: d[0].dob, cId: req.params.compId })
    })
    .catch(err => {
      console.log(err)
    })
}

//teams
exports.getTeam = (req, res, next) => {
  if (req.query.searchField) {  //if a request is made using the search bar by the user
    const search = req.query.searchField
    Team.find({
      $and: [
        { team: search },
        { companyId: req.params.compId }
      ]
    }).countDocuments()
      .then(count => {
        if (count == 0) {
          res.render('disp-all-teams', { count: count, path: '/' + encodeURIComponent(req.params.compId) + '/teams', cId: req.params.compId })
        }
        else {
          Team.find({
            $and: [
              { team: search },
              { companyId: req.params.compId }
            ]
          })
            .then(team => {
              res.render('disp-all-teams', { count: count, team: team, path: '/' + encodeURIComponent(req.params.compId) + '/teams', cId: req.params.compId })
            })
            .catch(err => {
              console.log(err)
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
  else {
    Team.countDocuments({ companyId: req.params.compId })
      .then(count => {
        if (count == 0) {
          res.render('disp-all-teams', { count: count, path: '/' + encodeURIComponent(req.params.compId) + '/teams', cId: req.params.compId })
        }
        else {
          Team.find({ companyId: req.params.compId })
            .then(team => {
              res.render('disp-all-teams', { count: count, team: team, path: '/' + encodeURIComponent(req.params.compId) + '/teams', cId: req.params.compId })
            })
            .catch(err => {
              console.log(err)
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

exports.postAddTeam = (req, res, next) => {
  const image = req.file
  new Team({
    team: req.body.team,
    teamDesc: req.body.teamDesc,
    imageUrl: image.path,
    companyId: req.params.compId,
    teamId: req.body.teamId
  }, { versionKey: false })
    .save()
    .then(team => {
      res.redirect('/' + encodeURIComponent(req.params.compId) + '/teams')
    })
}




//team-details
exports.getTeamDetails = (req, res, next) => {
  Member.countDocuments({
    $and: [
      { teamId: req.params.teamId },
      { companyId: req.params.compId }
    ]
  })
    .then(count => {
      if (count == 0) {
        res.render('disp-all-members', { count: count, path: '/' + encodeURIComponent(req.params.compId) + '/members', cId: req.params.compId })
      }
      else if (count > 0) {
        Member.find({
          $and: [
            { teamId: req.params.teamId },
            { companyId: req.params.compId }
          ]
        })
          .then(member => {

            res.render('disp-all-members', { count: count, member: member, path: '/' + encodeURIComponent(req.params.compId) + '/members', cId: req.params.compId })
          })
      }
    })
    .catch(err => {
      console.log(err)
    })
}

//add-team
exports.getAddTeam = (req, res, next) => {
  res.render('add-team', { path: ' ', cId: req.params.compId })
}

//delete-member
exports.deleteMem = (req, res, next) => {
  Member.findOne({ _id: req.params.memberId })
    .then(member => {
      fs.unlink(member.imageUrl, (err) => {
        console.log(err)
      })
      return Member.deleteOne({ _id: req.params.memberId })
    })

    .then(() => {
      res.redirect('/' + encodeURIComponent(req.params.compId) + '/members')
    })
    .catch(err => {
      console.log(err)
    })
}

//delete-team
exports.deleteTeam = (req, res, next) => {
  Member.updateMany(
    { teamId: req.params.teamId },
    {
      team: 'Team Not Assigned',
      teamHead: 'No',
      teamId: new mongoose.Types.ObjectId('000000000000000000000000')
    }
  )
    .then(() => {
      return Team.findOne({ _id: req.params.teamId })
    })
    .then(team => {
      fs.unlink(team.imageUrl, (err) => {
        console.log(err)
      })
      return Team.deleteOne({ _id: req.params.teamId })
    })
    .then(() => {
      res.redirect('/' + encodeURIComponent(req.params.compId) + '/teams')
    })
    .catch(err => {
      console.log(err)
    })
}

//edit-member
exports.getEditMember = (req, res, next) => {
  Team.find() //finding teams that exist so that they can be selected in the form
    .then(team => {
      return Promise.all([Member.findOne({ _id: req.params.memberId }), team])
    })
    .then(([member, team]) => {
      res.render('add-member', { team: team, path: ' ', cId: req.params.compId, edit: 'true', member: member })
    })
    .catch(err => {
      console.log(err)
    })
}

exports.postEditMember = (req, res, next) => {
  const image = req.file
  if (req.body.team != 'Team Not Assigned') {
    Member.findById(req.body.memberId)
      .then(member => {
        if (image) {
          fs.unlink(member.imageUrl, (err) => {
            console.log(err)
          })
        }
      })
      .then(() => {
        return Team.findOne({
          $and: [
            { team: req.body.team },
            { companyId: req.params.compId }
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
            imageUrl: image.path,
            jobTitle: req.body.jobTitle,
            jobDesc: req.body.jobDesc,
            team: req.body.team,
            teamId: team._id,
            teamHead: req.body.teamHead
          }
        )
      })
      .then(() => {
        res.redirect('/' + encodeURIComponent(req.params.compId) + '/members')
      })
      .catch(err => {
        console.log(err)
      })
  }
  else {
    Member.findById(req.body.memberId)
      .then(member => {
        if (image) {
          fs.unlink(member.imageUrl, (err) => {
            console.log(err)
          })
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
            imageUrl: image.path,
            jobTitle: req.body.jobTitle,
            jobDesc: req.body.jobDesc,
            team: req.body.team,
            teamId: new mongoose.Types.ObjectId('000000000000000000000000'),
            teamHead: req.body.teamHead
          }
        )
      })
      .then(() => {
        res.redirect('/' + encodeURIComponent(req.params.compId) + '/members')
      })
      .catch(err => {
        console.log(err)
      })
  }
}