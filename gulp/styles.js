'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var _ = require('lodash');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var wiredep = require('wiredep').stream;
var gulpif = require('gulp-if');


function watchStyles(watchPaths, example) {
  var isOnlyChange = function(event) {
    return event.type === 'changed';
  }

  gulp.watch(watchPaths, function(event) {
    if(isOnlyChange(event)) {
      if(example)
        return normalStyles(path.join(conf.paths.examples, '/**/*.css'), 'examples.css')
          .pipe(browserSync.stream());
      else{
        return sassWrapper(true)
          .pipe(browserSync.stream());
      }
    } else {
      gulp.start('inject-reload');
    }
  });
}

function sassWrapper(injectBower) {

  var sassOptions = {
    style: 'expanded'
  };

  var injectFiles = gulp.src([
    path.join(conf.paths.src, '/app/**/*.scss')
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
    .pipe(gulpif(injectBower, wiredep(_.extend({}, conf.wiredep))))
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
  return sassWrapper(true);
});

gulp.task('styles:with-out-bower', function() {
  return sassWrapper(false);
});

gulp.task('styles:watch', function() {
  return watchStyles([path.join(conf.paths.src, '/app/**/*.css'), path.join(conf.paths.src, '/app/**/*.scss')], false);
});

gulp.task('styles:examples', function() {
  return normalStyles(path.join(conf.paths.examples, '/**/*.css'), 'examples.css');
});

gulp.task('styles:examples-watch', function() {
  return watchStyles([path.join(conf.paths.examples, '/**/*.css')], true);
});
