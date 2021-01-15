const Campground = require('./models/campground');
const Review = require('./models/review');
const {campgroundSchema , reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressErro');//our own express error handler
module.exports.isLoggedIn = function (req,res, next) {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in first!');
        return res.redirect('/login');
    } else {
        next();
    }
}

//for campgrounds
module.exports.validateCampground = function (req,res,next) {
    //Apply Joi to validate our schema
    const {error} = campgroundSchema.validate(req.body);

    if (error) {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }

}

module.exports.isAuthor = async function (req,res,next) {
    console.log('validating')
    const {id} = req.params;
    const campground = await Campground.findById(id);

    if (!campground.author.equals(req.user._id)) {

        req.flash('error','Only author can edit it');
        return res.redirect(`/campgrounds/${id}`);
    }

    next();

}

//for review
module.exports.validateReview = function (req,res,next) {
    //Apply Joi to validate our schema

    const {error} = reviewSchema.validate(req.body);

    if (error) {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }

}

module.exports.isReviewAuthor = async function (req,res,next) {
    console.log('validating')
    const {id,reviewID} = req.params;
    const review = await Review.findById(reviewID);
    console.log(review)

    if (!review.author.equals(req.user._id)) {

        req.flash('error','Only author can delete it');
        return res.redirect(`/campgrounds/${id}`);
    }

    next();

}