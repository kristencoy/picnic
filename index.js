if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/expresserror');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/user');
const picnicRoutes = require('./routes/picnics');
const reviewRoutes = require('./routes/reviews');

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

app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //need app.use(session) before passport session (see above)
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req,res) => {
    const fake = new User({email: 'blah', username: 'smeh'})
    const newFake = await User.register(fake, 'chicken123') //model and password
    res.send(newFake);
})

app.use('/', userRoutes)
app.use('/picnics', picnicRoutes)
app.use('/picnics/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home');
})

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