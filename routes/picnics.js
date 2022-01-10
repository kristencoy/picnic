const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { picnicSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utils/expresserror');
const Picnic = require('../models/picnic');

const validatePicnic = (req, res, next) => {
    const { error } = picnicSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const picnics = await Picnic.find({});
    res.render('picnics/index', { picnics })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('picnics/new');
})

router.post('/', validatePicnic, catchAsync(async (req, res, next) => {
    // if(!req.body.picnic) throw new ExpressError('Invalid Picnic Data', 400);
    const picnicSchema = Joi.object({
        picnic: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required(),
            image: Joi.string().required(),
        }).required()
    })
    const { error } = picnicSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    const picnic = new Picnic(req.body.picnic);
    await picnic.save();
    req.flash('success', 'Picnic site added successfully.')
    res.redirect(`/picnics/${picnic._id}`);
}))

router.get('/:id', catchAsync(async (req, res) => {
    const picnic = await Picnic.findById(req.params.id).populate('reviews');
    if (!picnic){
        req.flash('error', 'Cannot find that picnic site.')
        return res.redirect('/picnics')
    }
    res.render('picnics/show', { picnic })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const picnic = await Picnic.findById(req.params.id)
    res.render('picnics/edit', { picnic })
}))

router.put('/:id', isLoggedIn, validatePicnic, catchAsync(async (req,res) =>{
    const { id } = req.params;
    const picnic = await Picnic.findByIdAndUpdate(id, {...req.body.picnic})
    req.flash('success', 'Picnic site edited successfully.')
    res.redirect(`/picnics/${picnic._id}`);
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req,res,next) => {
    const { id } = req.params;
    await Picnic.findByIdAndDelete(id);
    res.redirect('/picnics');
}))

module.exports = router;