var express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');
require('../utils/ExpressErro');
const catchAsync = require('../utils/catchAsync');//our own async error handler
const {isLoggedIn,validateReview,isReviewAuthor} = require('../middleware');



//Review a campground.
router.post('/',isLoggedIn,validateReview, catchAsync(
    async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id;
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash('success', 'You have successfully create your review');
        res.redirect(`/campgrounds/${campground._id}`)
    })
);

//delete the review
router.delete('/:reviewID',isLoggedIn,isReviewAuthor, catchAsync(
    async (req, res) => {
        const {id, reviewID} = req.params;
        await Campground.findByIdAndUpdate(id,{$pull:{reviews: reviewID}});
        await Review.findByIdAndDelete(reviewID);
        req.flash('success', 'You have successfully delete your review');
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;