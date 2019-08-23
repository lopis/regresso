var chalk = require('chalk');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var fs = require('fs');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var mkdirp = require('mkdirp');
var uglify = require('gulp-uglify-es').default;
var watch = require('gulp-watch');
var zip = require('gulp-zip');
var ts = require('gulp-typescript');

//Chalk colors
var error = chalk.bold.red;
var success = chalk.green;
var regular = chalk.white;

gulp.task('watch', (done) => {
	gulp.watch('./src/ts/*.ts', gulp.series('build-dev'));
	gulp.watch('./src/html/**/*.html', gulp.series('build-dev'));
	gulp.watch('./src/css/**/*.css', gulp.series('build-dev'));
	gulp.watch('./src/assets/**/*', gulp.series('build-dev'));
});

gulp.task('init', (done) => {
	//Create our directory structure
	mkdirp('./src', function (err) {
		mkdirp('./src/ts', function (err) {
			mkdirp('./src/html', function (err) {
				mkdirp('./src/css', function (err) {
					mkdirp('./src/assets', function (err) {
						done();
					});
				});
			});
		});
	});
});

gulp.task('build-js-dev', (done) => {
	return gulp.src('./build/js/*.js')
	.pipe(concat('main.js'))
	.pipe(gulp.dest('./build/'));
});
gulp.task('build-js-lib-dev', (done) => {
	return gulp.src('./build/js/lib/*.js')
	.pipe(concat('game-lib.js'))
	.pipe(gulp.dest('./build/'));
});

gulp.task('build-js', (done) => {
	return gulp.src('./build/js/*.js')
	.pipe(concat('main.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./build/'));
});

gulp.task('build-ts', function () {
    return gulp.src('./src/ts/*.ts')
	.pipe(ts({
		// noImplicitAny: true,
		outFile: 'main.js',
		removeComments: true,
	}))
	.pipe(gulp.dest('build'));
});

gulp.task('build-html', (done) => {
	return gulp.src('./src/html/**/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('./build/'));
});

gulp.task('build-css', (done) => {
	return gulp.src('./src/css/**/*.css')
		.pipe(cssmin())
		.pipe(gulp.dest('./build/'));
});

gulp.task('build-assets', (done) => {
	return gulp.src('./src/assets/**/*')
		.pipe(gulp.dest('./build/'));
});

gulp.task('zip', (done) => {
	return gulp.src('./build/**/*')
		.pipe(zip('entry.zip')) //gulp-zip performs compression by default
		.pipe(gulp.dest('dist'));
});

gulp.task('check', gulp.series('zip', (done) => {
	var stats = fs.statSync("./dist/entry.zip")
	var fileSize = stats.size;
	if (fileSize > 13312) {
		console.log(error("Your zip compressed game is larger than 13kb (13312 bytes)!"))
		console.log(regular("Your zip compressed game is " + fileSize + " bytes"));
	} else {
		console.log(success("Your zip compressed game is " + fileSize + " bytes."));
	}
	done();
}));

gulp.task('build-prod', gulp.series(
	'build-html',
	'build-ts',
	'build-js',
	'build-css',
	'build-assets',
	'check',
	'zip',
	(done) => {done();}
));
gulp.task('build-dev', gulp.series(
	'build-html',
	'build-ts',
	'build-js',
	'check',
	'build-js-dev',
	'build-js-lib-dev',
	'build-css',
	'build-assets',
	(done) => {done();}
));
