const {isLoggedIn,validateCampground,isAuthor} = require('../middleware');
const Campground = require('../models/campground');
const {campgroundSchema , reviewSchema} = require('../schemas');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const catchAsync = require('../utils/catchAsync');//our own async error handler

module.exports.index = async (req, res) => {
    const campGrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds:campGrounds})
};

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createNewCampgrounds = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1

    }).send()
    const campGround = await new Campground(req.body.campground);
    campGround.geometry = geoData.body.features[0].geometry;
    campGround.images = req.files.map(f => ({url: f.path,fileName:f.filename}));
    campGround.author = req.user._id;
    console.log(campGround);
    await campGround.save();
    console.log(campGround);
    req.flash('success', 'Successfully create campground');
    res.redirect(`/campgrounds/${campGround._id}`);
};

module.exports.showACampground = async (req, res) => {
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
};

module.exports.renderEditForm = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground:camp});
};

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'You have successfully delete the camprgound ');
    res.redirect(`/campgrounds`);
};