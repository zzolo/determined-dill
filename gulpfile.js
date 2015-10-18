/**
 * Gulp file for the Pickle Jumper project.  This handles tasks like building,
 * linting, and other helpful development things.
 */

// Dependencies
var gulp = require("gulp");
var jshint = require("gulp-jshint");
var jscs = require("gulp-jscs");
var plumber = require("gulp-plumber");
var util = require("gulp-util");
var header = require("gulp-header");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var less = require("gulp-less");
var recess = require("gulp-recess");
var cssminify = require("gulp-minify-css");
var autoprefixer = require("gulp-autoprefixer");
var webserver = require("gulp-webserver");
var babel = require("gulp-babel");

//var replace = require("gulp-replace");
/*
.pipe(replace(
  "REPLACE-DEFAULT-TEMPLATE",
  fs.readFileSync("src/tik-tok.tpl.html", {
    encoding: "utf-8"
  }).replace(/"/g, "\\\"").replace(/(\r\n|\n|\r|\s+)/g, " ")
))
*/

// Browser support (for autoprefixer).  This should be more defined
// for the project as a whole
var supportedBrowsers = ["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1"];

// Create banner to insert into files
var pkg = require("./package.json");
var banner = ["/**",
  " * <%= pkg.name %> - <%= pkg.description %>",
  " * @version v<%= pkg.version %>",
  " * @link <%= pkg.homepage %>",
  " * @license <%= pkg.license %>",
  " */",
  ""].join("\n");

// Plumber allows for better error handling and makes it so that
// gulp doesn"t crash so hard.  Good for watching and linting tasks
var plumberHandler = function(error) {
  if (error) {
    console.error(error);
    util.beep();
  }
  else {
    this.emit("end");
  }
};

// Support JS is a task to look at the supporting JS, like this
// file
gulp.task("support-js", function() {
  return gulp.src(["gulpfile.js"])
    .pipe(plumber(plumberHandler))
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"))
    .pipe(jscs({
      fix: true
    }));
});

// Main JS task.  Takes in files from src and outputs
// to dist.  Gets template and uses JSHint, JSCS, add header, minify
gulp.task("js", function() {
  return gulp.src("js/**/*.js")
    .pipe(plumber(plumberHandler))
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"))
    .pipe(jscs({
      fix: true
    }))
    .pipe(babel({
      modules: "common"
    }))
    .pipe(header(banner, { pkg: pkg }))

    // Non-minified version
    .pipe(gulp.dest("dist"))
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js"
    }))

    // Minified
    .pipe(gulp.dest("dist"));
});

// Styles.  Recess linting, Convert LESS to CSS, minify
gulp.task("styles", function() {
  return gulp.src("styles/**/*.less")
    .pipe(plumber(plumberHandler))
    .pipe(recess({
      noOverqualifying: false,
      noUniversalSelectors: false
    }))
    .pipe(less())
    .pipe(recess.reporter({
      fail: true
    }))
    .pipe(autoprefixer({
      browsers: supportedBrowsers
    }))
    .pipe(header(banner, { pkg: pkg }))

    // Non-minified version
    .pipe(gulp.dest("dist"))
    .pipe(cssminify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({
      extname: ".min.css"
    }))

    // Minified
    .pipe(gulp.dest("dist"));
});

// Watch for files that need to be processed
gulp.task("watch", function() {
  gulp.watch(["gulpfile.js"], ["support-js"]);
  gulp.watch(["js/**/*.js", "js/**/*.tpl"], ["js"]);
  gulp.watch("styles/**/*.less", ["styles"]);
});

// Web server for conveinence
gulp.task("webserver", function() {
  return gulp.src("./")
    .pipe(webserver({
      port: 8089,
      livereload: {
        enable: true,
        filter: function(file) {
          // Only watch dist and examples
          return (file.match(/dist|examples|index\.html/)) ? true : false;
        }
      },
      directoryListing: true,
      open: true
    }));
});

// Default task is a basic build
gulp.task("default", ["support-js", "js", "styles"]);

// Combine webserver and watch tasks for a more complete server
gulp.task("server", ["default", "watch", "webserver"]);
