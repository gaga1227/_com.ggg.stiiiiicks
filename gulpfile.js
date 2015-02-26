// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Compile Our Sass
gulp.task('sass', function() {
	return gulp.src('lib/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('lib/css'));
});

// Lint Task
gulp.task('lint', function() {
	return gulp.src('lib/js/app/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('appscripts', function() {
	return gulp.src('lib/js/app/**/*.js')
		.pipe(concat('app.js'))
		.pipe(gulp.dest('lib/js'))
		.pipe(rename('app.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('lib/js'));
});

gulp.task('vendorscripts', function() {
	return gulp.src('lib/js/vendor/**/*.js')
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('lib/js'))
		.pipe(rename('vendor.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('lib/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
	gulp.watch('lib/js/app/**/*.js', ['lint', 'appscripts']);
	gulp.watch('lib/scss/**/*.scss', ['sass']);
});

// Dev Tasks
gulp.task('dev', ['sass', 'lint', 'appscripts', 'watch']);

// Build Tasks
gulp.task('build', ['sass', 'lint', 'appscripts', 'vendorscripts']);

// Default Task
gulp.task('default', ['dev']);
