var express = require('express');
const router = express.Router({mergeParams: true});
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware');
const Campground = require('../models/campground');
const {campgroundSchema , reviewSchema} = require('../schemas');
require('../utils/ExpressErro');
const catchAsync = require('../utils/catchAsync');//our own async error handler



//Show all available campgrounds
router.get('/', catchAsync(
    async (req, res) => {
        const campGrounds = await Campground.find({});
        res.render('campgrounds/index',{campGrounds:campGrounds})
    })
);


//Show a new campground
router.get('/new',isLoggedIn, catchAsync(
    async (req, res) => {
        res.render('campgrounds/new')
    })
);

//store the new campground into our database and redirect it to the new campground.
//The reason we set the path as /campgrounds is based on the CRUD rule
router.post('/', isLoggedIn,validateCampground, catchAsync(
    async (req, res) => {
        const campGround = await new Campground(req.body.campground);
        campGround.author = req.user._id;
        await campGround.save();
        req.flash('success', 'Successfully create campground');
        res.redirect(`/campgrounds/${campGround._id}`);
    })
);



//Show individual campground detail
router.get('/:id', catchAsync(
    async (req, res) => {
        const campground = await Campground.findById(req.params.id).populate({
            path:'reviews',populate:{
                path:'author'
            }
        }).populate('author');
        if (!campground) {
            req.flash('error','Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show',{campground:campground});
    })
);



//Edit a specific campground
router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(
    async (req, res) => {
        const camp = await Campground.findById(req.params.id);
        res.render('campgrounds/edit',{campground:camp});
    })
);


router.put('/:id',isLoggedIn,isAuthor, validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    req.flash('success', 'Your edit have been saved');
    res.redirect(`/campgrounds/${id}`);
}));


//delete a campground
router.delete('/:id',isLoggedIn,isAuthor, catchAsync(
    async (req, res) => {
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'You have successfully delete the camprgound ');
        res.redirect(`/campgrounds`);
    })
);


module.exports = router;