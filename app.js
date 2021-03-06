const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const compression = require('compression');
const helmet = require('helmet');

require('dotenv').config();

const index = require('./routes/index');
const users = require('./routes/users');
const api = require('./routes/api');

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
app.set('trust proxy', true);

if (process.env.NODE_ENV === 'development') {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config');
  app.use(webpackDevMiddleware(webpack(webpackConfig), { publicPath: '/' }));
}

app.use(compression());
app.use(helmet());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(process.env.NODE_ENV === 'development' ? 'dev' : 'short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/api', api);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
