const Picnic = require('../models/picnic');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });


module.exports.index = async (req, res) => {
    const picnics = await Picnic.find({});
    res.render('picnics/index', { picnics })
}

module.exports.renderNewForm = (req, res) => {
    res.render('picnics/new');
}

module.exports.createPicnic = async (req, res, next) => {
    // if(!req.body.picnic) throw new ExpressError('Invalid Picnic Data', 400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.picnic.location,
        limit: 1
    }).send();
    const picnic = new Picnic(req.body.picnic);
    picnic.geometry = geoData.body.features[0].geometry;
    picnic.images = req.files.map( f=> ({url: f.path, filename: f.filename}) );
    picnic.author = req.user._id;
    await picnic.save();
    req.flash('success', 'Picnic site added successfully.')
    res.redirect(`/picnics/${picnic._id}`);
}

module.exports.showPicnic = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const picnic = await Picnic.findById(req.params.id);
    if (!picnic){
        req.flash('error', 'Cannot find that picnic site.');
        return res.redirect('/picnics');
    }
    res.render('picnics/edit', { picnic });
};

module.exports.updatePicnic = async (req,res) =>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.picnic.location,
        limit: 1
    }).send();
    const { id } = req.params;
    const picnic = await Picnic.findByIdAndUpdate(id, {...req.body.picnic})
    picnic.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map( f=> ({url: f.path, filename: f.filename}))
    picnic.images.push(...imgs);
    await picnic.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await picnic.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success', 'Picnic site edited successfully.')
    res.redirect(`/picnics/${picnic._id}`);
};

module.exports.deletePicnic = async (req,res,next) => {
    const { id } = req.params;
    await Picnic.findByIdAndDelete(id);
    req.flash('success', 'Picnicsite deleted successfully.');
    res.redirect('/picnics');
}