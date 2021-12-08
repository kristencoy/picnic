const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Picnic = require('./models/picnic');
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

// app.get('/makepicnic', async (req, res) => {
//     const pic = new Picnic({ title: 'Waterfront Park', location: 'Downtown Beaufort', image:'https://unsplash.com/collections/9824928/picnic' });
//     await pic.save();
//     res.send(pic)
// })

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/picnics', async (req, res) => {
    const picnics = await Picnic.find({});
    res.render('picnics/index', { picnics })
})

app.get('/picnics/new', (req, res) => {
    res.render('picnics/new');
})

app.post('/picnics', async (req,res) => {
    const picnic = new Picnic(req.body.picnic);
    await picnic.save();
    res.redirect(`/picnics/${picnic._id}`);
})

app.get('/picnics/:id', async (req, res) => {
    const picnic = await Picnic.findById(req.params.id)
    res.render('picnics/show', { picnic })
})

app.get('/picnics/:id/edit', async (req, res) => {
    const picnic = await Picnic.findById(req.params.id)
    res.render('picnics/edit', { picnic })
})

app.put('/picnics/:id', async (req,res) =>{
    const { id } = req.params;
    const picnic = await Picnic.findByIdAndUpdate(id, {...req.body.picnic})
    res.redirect(`/picnics/${picnic._id}`);
})

app.delete('/picnics/:id', async (req,res) => {
    const { id } = req.params;
    await Picnic.findByIdAndDelete(id);
    res.redirect('/picnics');
})

app.listen(3000, () => {
    console.log('listening on port 3000');
})