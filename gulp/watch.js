'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

gulp.task('watch', [
  'scripts:watch',
  'scripts:examples-watch',
  'styles:watch',
  'styles:examples-watch',
  'inject'], function () {
  gulp.watch([path.join(conf.paths.examples, '/*.html'), 'bower.json'], ['inject-reload']);
});
