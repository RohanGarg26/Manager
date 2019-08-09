const Member = require('../model/member')
const Team = require('../model/team')



//members
exports.getPostMember = (req, res, next) => {
  if (req.method == "POST") { //if request is post i.e. user has addaed new member
    const image = req.file
    Team.find({ team: req.body.team })  //finding the teams to be displayed in the views for selection
      .then(team => {
        if (req.body.team != 'None') {  //if a team was selected in the form
          new Member({  //creating a new document with details added by the user in the forn
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob,
            address: req.body.address,
            emailId: req.body.emailId,
            imageUrl: image.path,
            jobTitle: req.body.jobTitle,
            jobDesc: req.body.jobDesc,
            team: req.body.team,
            companyId: req.body.companyId,
            teamId: (team[0]._id),
            teamHead: req.body.teamHead
          }, { versionKey: false }).save()
        }
        else {  //if a team was not selected in the form
          new Member({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob,
            address: req.body.address,
            emailId: req.body.emailId,
            imageUrl: image.path,
            jobTitle: req.body.jobTitle,
            jobDesc: req.body.jobDesc,
            team: req.body.team,
            companyId: req.body.companyId,
            teamId: null,
            teamHead: req.body.teamHead
          }, { versionKey: false }).save()
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
  if (req.query.searchField) {  //if user uses the search bar for finding a member
    const search = req.query.searchField
    const firstN = search.split(' ')[0]
    const lastN = search.split(' ')[1]
    Member.find({
      $or: [{ firstName: search },
      { lastName: search },
      { jobTitle: search },
      { team: search },
      { $and: [{ firstName: firstN }, { lastName: lastN }] }]
    }).countDocuments() //counting the documents to display the cards in the template 
      .then(count => {
        if (count == 0) {
          res.render('disp-all-members', { count: count, path: '/members' })
        }
        else {
          Member.find({
            $or: [{ firstName: search },
            { lastName: search },
            { jobTitle: search },
            { team: search },
            { $and: [{ firstName: firstN }, { lastName: lastN }] }]
          })
            .then(member => {
              res.render('disp-all-members', { count: count, member: member, path: '/members' })
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
    Member.find().countDocuments()
      .then(count => {
        if (count == 0) {
          res.render('disp-all-members', { count: count, path: '/members' })
        }
        else {
          Member.find()
            .then(member => {
              res.render('disp-all-members', { count: count, member: member, path: '/members' })
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}

//add-member
exports.getAddMember = (req, res, next) => {
  Team.find() //finding teams that exist so that they can be selected in the form
    .then(team => {
      res.render('add-member', { team: team, path: ' ' })
    })
}

//member details
exports.getMemberDetails = (req, res, next) => {
  Member.find({ _id: req.params.memberId })
    .then(member => {
      Member.aggregate([  //to get the date from the db in the desired format
        {
          $project: {
            dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } }
          }
        }
      ])
        .then(d => {
          res.render('member-detail', { member: member[0], dob: d[0].dob })
        })
        .catch(err => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err)
    })
}

//teams
exports.getPostTeam = (req, res, next) => {
  if (req.method == "POST") { //if a post request is made by submitting the form to ad a new team
    const image = req.file
    new Team({
      team: req.body.team,
      teamDesc: req.body.teamDesc,
      imageUrl: image.path,
      companyId: req.body.companyId,
      teamId: req.body.teamId
    }, { versionKey: false })
      .save()
  }
  if (req.query.searchField) {  //if a request is made using the search bar by the user
    const search = req.query.searchField
    Team.find({ team: search }).countDocuments()
      .then(count => {
        if (count == 0) {
          res.render('disp-all-teams', { count: count, path: '/teams' })
        }
        else {
          Team.find({ team: search })
            .then(team => {
              res.render('disp-all-teams', { count: count, team: team, path: '/teams' })
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
  else {  //if either a get request is made or new team is added
    Team.find().estimatedDocumentCount()
      .then(count => {
        if (count == 0) {
          res.render('disp-all-teams', { count: count, path: '/teams' })
        }
        else {
          Team.find()
            .then(team => {
              res.render('disp-all-teams', { count: count, team: team, path: '/teams' })
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

//team-details
exports.getTeamDetails = (req, res, next) => {
  Member.find().countDocuments({ teamId: req.params.teamId })
    .then(count => {
      if (count == 0) {
        res.render('disp-all-members', { count: count, path: '/members' })
      }
      else if (count > 0) {
        Member.find({ teamId: req.params.teamId })
          .then(member => {

            res.render('disp-all-members', { count: count, member: member, path: '/members' })
          })
      }
    })
    .catch(err => {
      console.log(err)
    })
}

//add-team
exports.getAddTeam = (req, res, next) => {
  res.render('add-team', { path: ' ' })
}