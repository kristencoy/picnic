const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const Picnic = require('./models/picnic');
const ExpressError = require('./utils/expresserror');
const { picnicSchema } = require('./schemas.js');
const { get } = require('http');
const { urlencoded } = require('express');

mongoose.connect('mongodb://localhost:27017/picnicky', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded ({ extended: true})); //parse body
app.use(methodOverride('_method'));

const validatePicnic = (req, res, next) => {
    const { error } = picnicSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/picnics', catchAsync(async (req, res) => {
    const picnics = await Picnic.find({});
    res.render('picnics/index', { picnics })
}))

app.get('/picnics/new', (req, res) => {
    res.render('picnics/new');
})

app.post('/picnics', validatePicnic, catchAsync(async (req, res, next) => {
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
    res.redirect(`/picnics/${picnic._id}`);
}))

app.get('/picnics/:id', catchAsync(async (req, res) => {
    const picnic = await Picnic.findById(req.params.id)
    res.render('picnics/show', { picnic })
}))

app.get('/picnics/:id/edit', catchAsync(async (req, res) => {
    const picnic = await Picnic.findById(req.params.id)
    res.render('picnics/edit', { picnic })
}))

app.put('/picnics/:id', validatePicnic, catchAsync(async (req,res) =>{
    const { id } = req.params;
    const picnic = await Picnic.findByIdAndUpdate(id, {...req.body.picnic})
    res.redirect(`/picnics/${picnic._id}`);
}))

app.delete('/picnics/:id', catchAsync(async (req,res,next) => {
    const { id } = req.params;
    await Picnic.findByIdAndDelete(id);
    res.redirect('/picnics');
}))

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Somethin' ain't right."
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
    console.log('listening on port 3000');
})