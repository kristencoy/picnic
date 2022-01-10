const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Review = require('../models/review');
const Picnic = require('../models/picnic');
const { reviewSchema } = require('../schemas.js');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expresserror');

router.post('/', isLoggedIn, validateReview, catchAsync(async(req,res) => {
    const picnic = await Picnic.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    picnic.reviews.push(review);
    await review.save();
    await picnic.save();
    req.flash('success', 'Review added successfully.');
    res.redirect(`/picnics/${picnic._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req,res) => {
    const{ id, reviewId } = req.params;
    await Picnic.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully.')
    res.redirect(`/picnics/${id}`);
}))

module.exports = router;