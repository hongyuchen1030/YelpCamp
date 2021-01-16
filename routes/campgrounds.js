var express = require('express');
const router = express.Router({mergeParams: true});
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware');
const Campground = require('../models/campground');
const {campgroundSchema , reviewSchema} = require('../schemas');
const ExpressError=require('../utils/ExpressErro');
const catchAsync = require('../utils/catchAsync');//our own async error handler
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer')

const {cloudinary,storage} = require('../cloudinary');
const upload = multer({ storage})


router.route('/')
    //Show all available campgrounds
    .get(catchAsync(
        campgrounds.index))
    //store the new campground into our database and redirect it to the new campground.
    //The reason we set the path as /campgrounds is based on the CRUD rule
    .post(isLoggedIn,upload.array('image'),validateCampground, catchAsync(
        campgrounds.createNewCampgrounds)
    );




//Show a new campground
router.get('/new',isLoggedIn, catchAsync(
    campgrounds.renderNewForm)
);



router.route('/:id')
    //Show individual campground detail
    .get(catchAsync(
    campgrounds.showACampground))
    //Edit a specific campground
    .put(isLoggedIn,isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    //delete a campground
    .delete(isLoggedIn,isAuthor, catchAsync(
        campgrounds.deleteCampground)
    );





router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(
    campgrounds.renderEditForm)
);




module.exports = router;