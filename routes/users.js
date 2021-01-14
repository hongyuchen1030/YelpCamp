const express = require('express');
const router = express.Router();
const User = require('../models/users');
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

  } catch (e){
    req.flash('error',e.message);
    res.redirect('register');

  } finally {
    req.flash('success','Welcome to YelpCamp!!!');
    res.redirect('/campgrounds');

  }


}));



module.exports = router;
