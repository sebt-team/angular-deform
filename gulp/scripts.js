'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');
var webpack = require('webpack-stream');

var $ = require('gulp-load-plugins')();

function webpackWrapper(watch, test, callback, baseDir, scriptName) {
  var webpackOptions = {
    watch: watch,
    module: {
      preLoaders: [{ test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader?jquery[]=true'}],
      loaders: [{ test: /\.js$/, exclude: /node_modules/, loaders: ['ng-annotate', 'babel-loader?presets[]=es2015']}]
    },
    output: { filename: (scriptName || 'index.module.js') }
  };

  if(watch) {
    webpackOptions.devtool = 'inline-source-map';
  }

  var webpackChangeHandler = function(err, stats) {
    if(err) {
      conf.errorHandler('Webpack')(err);
    }
    $.util.log(stats.toString({
      colors: $.util.colors.supportsColor,
      chunks: false,
      hash: false,
      version: false
    }));
    browserSync.reload();
    if(watch) {
      watch = false;
      callback();
    }
  };

  var sources = [baseDir];
  if (test) {
    sources.push(path.join(conf.paths.src, '/app/**/*.spec.js'));
  }

  return gulp.src(sources)
    .pipe(webpack(webpackOptions, null, webpackChangeHandler))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')));
}

function normalScript(watch, baseDir, scriptName) {

  var scriptChangeHandler = function() {
    return gulp.src(baseDir)
      .pipe($.jshint())
      .pipe($.concat(scriptName))
      .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')));
  }

  if(watch)
    gulp.watch(baseDir, function (event) {
      scriptChangeHandler()
      .pipe(browserSync.stream());
    });
  else
    scriptChangeHandler();
}

gulp.task('scripts', function () {
  return webpackWrapper(false, false, null, path.join(conf.paths.src, '/app/index.module.js'));
});

gulp.task('scripts:watch', ['scripts'], function (callback) {
  return webpackWrapper(true, false, callback, path.join(conf.paths.src, '/app/index.module.js'));
});

gulp.task('scripts:examples', function () {
  return normalScript(false, path.join(conf.paths.examples, '/**/*.js'), 'samples.js');
});

gulp.task('scripts:examples-watch', function () {
  normalScript(true, path.join(conf.paths.examples, '/**/*.js'), 'samples.js');
});

gulp.task('scripts:test', function () {
  return webpackWrapper(false, true, null, path.join(conf.paths.src, '/app/index.module.js'));
});

gulp.task('scripts:test-watch', ['scripts'], function (callback) {
  return webpackWrapper(true, true, callback, path.join(conf.paths.src, '/app/index.module.js'));
});
