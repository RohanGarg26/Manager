//middleware to check if data manager is logged in 
exports.teamMemberIsAuth = (req, res, next) => {
  if (!req.session.TMisLoggedIn) {
    res.render('unauthorized-access')
  }
  next()
}

exports.teamHeadIsAuth = (req, res, next) => {
  if (!req.session.THisLoggedIn) {
    res.render('unauthorized-access')
  }
  next()
}