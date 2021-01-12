//basic connection here
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {campgroundSchema} = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressErro');//our own express error handler
const catchAsync = require('./utils/catchAsync');//our own async error handler


//database setup
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex:true,
  useUnifiedTopology:true
});
//DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

//set up the app
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

//Useful Method
const validateCampground = function (req,res,next) {
    //Apply Joi to validate our schema

    const {error} = campgroundSchema.validate(req.body);

    if (error) {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }

}


//start the webpage writing
app.listen(3000,() => {
    console.log('Serving on port 3000')
});
//Home pafe
app.get('/',(req, res) => {
  res.render('home',{title:'YelpCamp'})
});

//Show all available campgrounds
app.get('/campgrounds', catchAsync(
    async (req, res) => {
      const campGrounds = await Campground.find({});
      res.render('campgrounds/index',{campGrounds:campGrounds})
    })
);


//Show a new campground
app.get('/campgrounds/new', catchAsync(
    async (req, res) => {
      res.render('campgrounds/new')
    })
);

//store the new campground into our database and redirect it to the new campground.
//The reason we set the path as /campgrounds is based on the CRUD rule
app.post('/campgrounds', validateCampground, catchAsync(
    async (req, res) => {
        const campGround = await new Campground(req.body.campground);
        await campGround.save();
        res.redirect(`/campgrounds/${campGround._id}`);
    })
);



//Show individual campground detail
app.get('/campgrounds/:id', catchAsync(
    async (req, res) => {
      const campground = await Campground.findById(req.params.id).populate('reviews');
      res.render('campgrounds/show',{campground:campground});
    })
);

//Review a campground.
app.post('/campgrounds/:id/reviews', catchAsync(
    async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
    })
);

//delete the review
app.delete('/campgrounds/:id/reviews/:reviewID', catchAsync(
    async (req, res) => {
        const {id, reviewID} = req.params;
        await Campground.findByIdAndUpdate(id,{$pull:{reviews: reviewID}});
        await Review.findByIdAndDelete(reviewID);
        res.redirect(`/campgrounds/${id}`);
    })
);

//Edit a specific campground
app.get('/campgrounds/:id/edit', catchAsync(
    async (req, res) => {
      const camp = await Campground.findById(req.params.id);
      res.render('campgrounds/edit',{campground:camp});
    })
);


app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {

  const {id} = req.params;
  const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground});
  res.redirect(`/campgrounds/${id}`);
}));


//delete a campground
app.delete('/campgrounds/:id', catchAsync(
    async (req, res) => {
      const {id} = req.params;
      await Campground.findByIdAndDelete(id);
      res.redirect(`/campgrounds`);
    })
);















// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
//
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
//
// var app = express();
//
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
//
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
//
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(new ExpressError('You are out of camp now',404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{err:err});
});
//
module.exports = app;
