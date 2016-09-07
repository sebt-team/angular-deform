'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var _ = require('lodash');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var wiredep = require('wiredep').stream;


function watchStyles(watchPaths, example) {
  var isOnlyChange = function(event) {
    return event.type === 'changed';
  }

  gulp.watch(watchPaths, function(event) {
    if(isOnlyChange(event)) {
      if(example)
        return normalStyles(path.join(conf.paths.examples, '/**/*.css'), 'examples.css')
          .pipe(browserSync.stream());
      else
        return sassWrapper()
          .pipe(browserSync.stream());
    } else {
      gulp.start('inject-reload');
    }
  });
}

function sassWrapper() {

  var sassOptions = {
    style: 'expanded'
  };

  var injectFiles = gulp.src([
    path.join(conf.paths.src, '/app/**/*.scss'),
    path.join('!' + conf.paths.src, '/app/index.scss')
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(conf.paths.src + '/app/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  return gulp.src([
    path.join(conf.paths.src, '/app/index.scss')
  ])
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe($.sourcemaps.init())
    .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
}


function normalStyles(baseDir, scriptName) {
  return gulp.src(baseDir)
    .pipe($.concat(scriptName))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')));
}

gulp.task('styles', function() {
  return sassWrapper();
});

gulp.task('styles:watch', function() {
  return watchStyles([path.join(conf.paths.src, '/app/**/*.css')], false);
});

gulp.task('styles:examples', function() {
  return normalStyles(path.join(conf.paths.examples, '/**/*.css'), 'examples.css');
});

gulp.task('styles:examples-watch', function() {
  return watchStyles([path.join(conf.paths.examples, '/**/*.css')], true);
});
