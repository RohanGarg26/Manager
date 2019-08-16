//middleware to check if data manager is logged in 
exports.memberIsAuth = (req, res, next) => {
  if (!req.session.AMisLoggedIn) {
    res.render('unauthorized-access')
  }
  next()
}