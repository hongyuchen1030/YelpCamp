var express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');
require('../utils/ExpressErro');
const catchAsync = require('../utils/catchAsync');//our own async error handler
const {isLoggedIn,validateReview,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');


//Review a campground.
router.post('/',isLoggedIn,validateReview, catchAsync( reviews.newReview));

//delete the review
router.delete('/:reviewID',isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview)
);

module.exports = router;