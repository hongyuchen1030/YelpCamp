
const Campground = require('../models/campground');
const Review = require('../models/review');
require('../utils/ExpressErro');
const catchAsync = require('../utils/catchAsync');//our own async error handler
const {isLoggedIn,validateReview,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');



module.exports.newReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'You have successfully create your review');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteReview = async (req, res) => {
    const {id, reviewID} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'You have successfully delete your review');
    res.redirect(`/campgrounds/${id}`);
};