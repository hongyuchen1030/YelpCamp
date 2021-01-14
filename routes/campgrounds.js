var express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require('../models/campground');
const {campgroundSchema , reviewSchema} = require('../schemas');
const ExpressError = require('../utils/ExpressErro');//our own express error handler
const catchAsync = require('../utils/catchAsync');//our own async error handler

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

//Show all available campgrounds
router.get('/', catchAsync(
    async (req, res) => {
        const campGrounds = await Campground.find({});
        res.render('campgrounds/index',{campGrounds:campGrounds})
    })
);


//Show a new campground
router.get('/new', catchAsync(
    async (req, res) => {
        res.render('campgrounds/new')
    })
);

//store the new campground into our database and redirect it to the new campground.
//The reason we set the path as /campgrounds is based on the CRUD rule
router.post('/', validateCampground, catchAsync(
    async (req, res) => {
        const campGround = await new Campground(req.body.campground);
        await campGround.save();
        req.flash('success', 'Successfully create campground');
        res.redirect(`/campgrounds/${campGround._id}`);
    })
);



//Show individual campground detail
router.get('/:id', catchAsync(
    async (req, res) => {
        const campground = await Campground.findById(req.params.id).populate('reviews');
        if (!campground) {
            req.flash('error','Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show',{campground:campground});
    })
);



//Edit a specific campground
router.get('/:id/edit', catchAsync(
    async (req, res) => {
        const camp = await Campground.findById(req.params.id);
        res.render('campgrounds/edit',{campground:camp});
    })
);


router.put('/:id', validateCampground, catchAsync(async (req, res) => {

    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    if (!campground) {
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    req.flash('success', 'Your edit have been saved');
    res.redirect(`/campgrounds/${id}`);
}));


//delete a campground
router.delete('/:id', catchAsync(
    async (req, res) => {
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'You have successfully delete the camprgound ');
        res.redirect(`/campgrounds`);
    })
);


module.exports = router;