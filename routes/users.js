const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');
const ExpressError = require('../utils/ExpressErro');//our own express error handler
const catchAsync = require('../utils/catchAsync');//our own async error handler

//User Registration
router.get('/register', function(req, res, next) {
  res.render('users/register');
});

router.post('/register',  catchAsync(async function(req, res, next) {
  try {
    const {email,username,password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, err => {
      if (err) return next(err);
    })
    req.flash('success',`Welcome to YelpCamp ${registeredUser.username}`);

    res.redirect('/campgrounds');


  } catch (e){
    req.flash('error',e.message);
    return res.redirect('register');

  }
}));

//User Login
router.get('/login',(req,res,next) =>{
  res.render('users/login')
});

router.post('/login', passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),(req,res,next) =>{
  req.flash('success',`Welcome to YelpCamp ${req.user.username}`);
  const redirectUrl = req.session.returnTo ||'/campgrounds'
  delete req.session.retuenTo;
  res.redirect(redirectUrl);
});

//User Logout
router.get('/logout',(req,res) => {
  req.logout();
  req.flash('success','Good bye!');
  res.redirect('/');
})


module.exports = router;
