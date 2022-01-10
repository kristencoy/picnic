const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAuthor, validatePicnic } = require('../middleware');

const Picnic = require('../models/picnic');


router.get('/', catchAsync(async (req, res) => {
    const picnics = await Picnic.find({});
    res.render('picnics/index', { picnics })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('picnics/new');
})

router.post('/', isLoggedIn, validatePicnic, catchAsync(async (req, res, next) => {
    // if(!req.body.picnic) throw new ExpressError('Invalid Picnic Data', 400);
    const picnic = new Picnic(req.body.picnic);
    picnic.author = req.user._id;
    await picnic.save();
    req.flash('success', 'Picnic site added successfully.')
    res.redirect(`/picnics/${picnic._id}`);
}))

router.get('/:id', catchAsync(async (req, res) => {
    const picnic = await Picnic.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!picnic){
        req.flash('error', 'Cannot find that picnic site.')
        return res.redirect('/picnics')
    }
    res.render('picnics/show', { picnic })
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const picnic = await Picnic.findById(req.params.id);
    if (!picnic){
        req.flash('error', 'Cannot find that picnic site.');
        return res.redirect('/picnics');
    }
    res.render('picnics/edit', { picnic });
}))

router.put('/:id', isLoggedIn, isAuthor, validatePicnic, catchAsync(async (req,res) =>{
    const { id } = req.params;
    const picnic = await Picnic.findByIdAndUpdate(id, {...req.body.picnic})
    req.flash('success', 'Picnic site edited successfully.')
    res.redirect(`/picnics/${picnic._id}`);
}))


router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req,res,next) => {
    const { id } = req.params;
    await Picnic.findByIdAndDelete(id);
    req.flash('success', 'Picnicsite deleted successfully.');
    res.redirect('/picnics');
}))

module.exports = router;