var gulp = require("gulp"),
  jade = require("gulp-jade"),
  eslint = require("gulp-eslint"),
  paths = {
    'scripts': [
      'public/javascripts/**/*.js',
      '!node_modules/**',
      '!public/javascripts/libs/**'
    ],
  };

gulp.task('lint', function () {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('default', ['lint'], function () {
  console.log('Ready to Go!');
});