//middleware to check if data manager is logged in 
exports.isAuth = (req, res, next) => {
  if (!req.session.DMisLoggedIn) {
    res.render('unauthorized-access')
  }
  next()
}