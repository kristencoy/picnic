const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Review = require('../models/review');
const Picnic = require('../models/picnic');
const { reviewSchema } = require('../schemas.js');
const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expresserror');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;