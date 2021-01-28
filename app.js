
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



//basic connection here
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressErro');//our own express error handler
const catchAsync = require('./utils/catchAsync');//our own async error handler
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/users');
const multer  = require('multer')
const mongoSanitize = require('express-mongo-sanitize');;
const helmet = require('helmet');
const {cloudinary,storage} = require('./cloudinary');
const upload = multer({ storage})
//Session
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);


const db_url = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
    //process.env.DB_URL;
//'mongodb://localhost:27017/yelp-camp'
//database setup
mongoose.connect(db_url, {
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



//Session
const secret = process.env.SECRET || 'huskysecret';
const store = new MongoStore({
    url:db_url,
    secret,
    touchAfter:24*60*60

});

store.on("error",function (e){
    console.log("SESSION STORE ERROR",e);
})
const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }

}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://ka-f.fontawesome.com"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "https://res.cloudinary.com/hongyu/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com",
                "https://source.unsplash.com/",
                "data:image/webp"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



//Router use

const campgroundsRouter = require('./routes/campgrounds');
const reviewsRouter = require('./routes/reviews');
const usersRouter = require('./routes/users');
app.use('/',usersRouter);
app.use('/campgrounds',campgroundsRouter);
app.use('/campgrounds/:id/reviews',reviewsRouter);

//Static setting
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());





//start the webpage writing
app.listen(3000,() => {
    console.log('Serving on port 3000')
});
//Home page
app.get('/',(req, res) => {
  res.render('index',{title:'YelpCamp'})
});





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
