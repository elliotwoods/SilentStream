var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const { PeerServer } = require('peer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);

app.get('/view', function (req, res) {
	res.send('View');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

// Set the port for the Express application
const PORT = process.env.PORT || 5000;

// Start the Express server
const server = app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}/`);
	console.log(`For broadcasting go to http://localhost:${PORT}/broadcast.html`);
	console.log(`Clients can connect at http://localhost:${PORT}/`);
});
  
// PeerServer is running on port 9000
const peerServer = PeerServer({ port: 9000 }, () => {
	console.log('PeerServer is running on port 9000');
});

module.exports = app;
