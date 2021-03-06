var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Handlebars = require('hbs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site
var compression = require('compression');
var helmet = require('helmet');

var PORT = process.env.PORT || 3000;

var app = express();

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.DB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  if (arg1 == arg2) {
    return options.fn(this);
  }
  else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('ifUnequal', function (arg1, arg2, options) {
  if (arg1 != arg2) {
    return options.fn(this);
  }
  else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('isSelected', function (arg1, arg2, options) {
  arg1.toString() == arg2 ? 'selected' : false;
});

Handlebars.registerHelper('isSelectedString', function (arg1, arg2, options) {
  arg1.toString() == arg2.toString() ? 'selected' : false;
});

Handlebars.registerHelper('isSelectedOr', function (arg1, arg2, arg3, options) {
  if ((arg1.toString() == arg2) || (arg1 == arg3)) {
    return 'selected';
  }
  else {
    return false;
  }
});

Handlebars.registerHelper('stringify', function (arg1, arg2, options) {
  return arg1.toString() + arg2;
});

Handlebars.registerHelper('string', function (arg1, options) {
  return arg1.toString();
});

Handlebars.registerHelper('dateSlice', function (arg1, options) {
  return arg1.toISOString().slice(0, 10);
});

Handlebars.registerHelper('dateSliceAuthor', function (arg1, options) {
  if (/\d/.test(arg1) === true) {
    return arg1.toISOString().slice(0, 10);
  }
});

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); //Compress all routes

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});

module.exports = app;
