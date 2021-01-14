var express = require('express');
const router = express.Router({mergeParams: true});
const {campgroundSchema , reviewSchema} = require('../schemas');
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressErro');//our own express error handler
const catchAsync = require('../utils/catchAsync');//our own async error handler

//Useful Method
const validateReview = function (req,res,next) {
    //Apply Joi to validate our schema

    const {error} = reviewSchema.validate(req.body);

    if (error) {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }

}


//Review a campground.
router.post('/',validateReview, catchAsync(
    async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash('success', 'You have successfully create your review');
        res.redirect(`/campgrounds/${campground._id}`)
    })
);

//delete the review
router.delete('/:reviewID', catchAsync(
    async (req, res) => {
        const {id, reviewID} = req.params;
        await Campground.findByIdAndUpdate(id,{$pull:{reviews: reviewID}});
        await Review.findByIdAndDelete(reviewID);
        req.flash('success', 'You have successfully delete your review');
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;