var chalk = require('chalk');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var concatCss = require('gulp-concat-css');
var fs = require('fs');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var mkdirp = require('mkdirp');
var uglify = require('gulp-uglify-es').default;
var watch = require('gulp-watch');
var zip = require('gulp-zip');
var ts = require('gulp-typescript');
var inject = require('gulp-inject');

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
	return gulp.src('./build/*.js')
	.pipe(concat('main.js'))
	.pipe(gulp.dest('./build/'));
});

gulp.task('build-js', (done) => {
	return gulp.src('./build/*.js')
	.pipe(concat('main.js'))
	.pipe(uglify({
    mangle: {
      toplevel: true
    },
  }))
	.pipe(gulp.dest('./build/'));
});

gulp.task('build-ts', function () {
    return gulp.src('./src/ts/*.ts')
	.pipe(ts({
		// noImplicitAny: true,
		outFile: 'main.js',
    removeComments: true,
    target: "es2015",
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
    .pipe(concatCss('style.css'))
    .pipe(cssmin())
		.pipe(gulp.dest('./build/'));
});
gulp.task('inject-css', (done) => {
  return gulp.src('./build/index.html')
    .pipe(inject(gulp.src(['./build/style.css']), {
      removeTags: true,
      starttag: '/* inject:css */',
      endtag: '/* endinject */',
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8')
      }
    }))
    .pipe(gulp.dest('./build'))
})


gulp.task('build-assets', (done) => {
	return gulp.src('./src/assets/**/*')
		.pipe(gulp.dest('./build/'));
});

gulp.task('zip', (done) => {
	return gulp.src([
    './build/*.html',
    './build/*.js',
    './build/*.png',
  ])
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

gulp.task('inject-svg', function () {
  return gulp.src('./build/index.html')
    .pipe(inject(gulp.src(['./src/assets/island.svg']), {
      removeTags: true,
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8')
      }
    }))
    .pipe(gulp.dest('./build'));
});

gulp.task('build-prod', gulp.series(
  'build-html',
  'inject-svg',
	'build-ts',
	'build-js',
  'build-css',
  'inject-css',
	'build-assets',
	'check',
	'zip',
	(done) => {console.log('\x07');done();}
));
gulp.task('build-dev', gulp.series(
	'build-html',
  'inject-svg',
	'build-ts',
  'build-css',
  'inject-css',
	'build-js',
	'check',
	'build-ts',
	'build-js-dev',
  'build-css',
  'inject-css',
	'build-assets',
	(done) => {console.log('\x07');done();}
));
