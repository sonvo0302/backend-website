const express = require('express');
const { response } = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/api/views');

app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));

const filmRoutes = require('./api/routes/films');
const categoryRoutes = require('./api/routes/categories');
//const filmcategoryRoutes =require('./api/routes/film_category');
// const userRoutes = require('./api/routes/user');
const directorRouter = require('./api/routes/directors');
const userinfoRouter = require('./api/routes/user_info');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
//connect to MongoDB

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected Successfully'));
mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	if (res.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}
	next();
});
const usersRoutes = require('./api/routes/users');
const ratingRoutes = require('./api/routes/ratings');
const commentRoutes = require('./api/routes/comments');
const film_user_history = require('./api/routes/film_user_histories');
const imageRoute = require('./api/routes/image');

//Routes which should handle requests
app.use('/film', filmRoutes);
app.use('/category', categoryRoutes);
// app.use('/film_category',filmcategoryRoutes);

app.use('/user', usersRoutes);
app.use('/director', directorRouter);
app.use('/user_info', userinfoRouter);
app.use('/rating', ratingRoutes);
app.use('/comment', commentRoutes);
app.use('/film_user_history', film_user_history);
app.use('/image', imageRoute);

const adminRoutes = require('./api/routes/admin');
app.use('/admin', adminRoutes)

const filmManager = require('./api/routes/filmManager');
app.use('/filmManager', filmManager);

const userManager = require('./api/routes/userManager');
app.use('/userManager', userManager)

app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status(404);
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});
});

app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
