const express = require('express');
const router = express.Router({ mergeParams: true });

const Review = require('../models/review');
const Picnic = require('../models/picnic');
const { reviewSchema } = require('../schemas.js');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expresserror');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async(req,res) => {
    const picnic = await Picnic.findById(req.params.id);
    const review = new Review(req.body.review);
    picnic.reviews.push(review);
    await review.save();
    await picnic.save();
    req.flash('success', 'Review added successfully.')
    res.redirect(`/picnics/${picnic._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req,res) => {
    const{ id, reviewId } = req.params;
    await Picnic.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully.')
    res.redirect(`/picnics/${id}`);
}))

module.exports = router;