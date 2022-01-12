const express = require('express');
const router = express.Router();
const picnics = require('../controllers/picnics');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validatePicnic } = require('../middleware');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(picnics.index))
    .post(isLoggedIn, upload.array('image'), validatePicnic, catchAsync(picnics.createPicnic))


router.get('/new', isLoggedIn, picnics.renderNewForm);

router.route('/:id')
    .get(catchAsync(picnics.showPicnic))
    .put(isLoggedIn, isAuthor, upload.array('image'), validatePicnic, catchAsync(picnics.updatePicnic))
    .delete(isLoggedIn, isAuthor, catchAsync(picnics.deletePicnic));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(picnics.renderEditForm));

module.exports = router;