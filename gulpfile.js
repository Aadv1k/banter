const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const nodemon = require("gulp-nodemon");
const browserSync = require("browser-sync").create();
const rename = require("gulp-rename");
const { PORT } = require("./common/constants.js");

const stylesSrcPath = "./scss/**/*.scss";
const stylesDestPath = "./public/";
const serverPath = "./index.js";

function buildStyles() {
  return gulp
    .src(stylesSrcPath)
    .pipe(sass().on("error", sass.logError))
    .pipe(rename("style.css"))
    .pipe(gulp.dest(stylesDestPath))
    .pipe(browserSync.stream());
}

function initBrowser() {
  browserSync.init({ proxy: `http://localhost:${PORT}`, port: 4000, open: false }, () =>
    console.log("started")
  );
}

function reloadBrowserSync(cb) {
  browserSync.reload();
  cb();
}

function runServer() {
  nodemon({
    script: serverPath,
    ext: "js",
    ignore: ["./public/*"]
  }).on("restart", () => {
    setTimeout(browserSync.reload, 1000);
  });
}

function watchFiles() {
  gulp.watch(stylesSrcPath, gulp.series(buildStyles, reloadBrowserSync));
  gulp.watch("./views/*.ejs", gulp.series(reloadBrowserSync));
}

module.exports = {
  dev: gulp.parallel(watchFiles, gulp.parallel(runServer, initBrowser)),
  build: gulp.series(buildStyles)
};
