exports.isAuth = (req,res,next) => {
  if(!req.session.DMisLoggedIn){
    res.redirect('/login')
  }
  next()
}