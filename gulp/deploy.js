var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')();

gulp.task('deploy', ['build:examples'], function() {
  return gulp.src(path.join(conf.paths.examplesDist, '/**/*'))
    .pipe($.ghPages())
    .on('end', function () {
      gulp.src(path.join(conf.paths.examplesDist))
        .pipe($.clean({force: true}));
    });
});
