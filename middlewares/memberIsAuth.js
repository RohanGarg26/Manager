//middleware to check if data manager is logged in 
exports.teamMemberIsAuth = (req, res, next) => {
  if (!req.session.TMisLoggedIn) {
    return res.render('unauthorized-access')
  }
  next()
}

exports.teamHeadIsAuth = (req, res, next) => {
  if (!req.session.THisLoggedIn) {
    return res.render('unauthorized-access')
  }
  next()
}