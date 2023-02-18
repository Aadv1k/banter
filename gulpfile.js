const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const nodemon = require("gulp-nodemon");
const browserSync = require("browser-sync").create();
const rename = require("gulp-rename");
const { PORT } = require("./app/constants.js");

const stylesSrcPath = "./scss/**/*.scss";
const stylesDestPath = "./public/css";
const serverPath = "./index.js";

function buildStyles() {
  return gulp
    .src(stylesSrcPath)
    .pipe(sass().on("error", sass.logError))
    .pipe(rename("style.css"))
    .pipe(gulp.dest(stylesDestPath))
    .pipe(browserSync.stream())
}

function runServer() {
  nodemon({
    script: "./index.js",
    ext: "js",
    ignore: ["./public/*"]
  })
  .on("start", () => { browserSync.init({ proxy: `http://localhost:${PORT}`, port: 4000, open: false}, () => console.log("started"))},)
  .on("restart", () => {setTimeout(browserSync.reload, 3000)});
}

function watchStyles() {
  gulp.series(buildStyles);
  gulp.watch("./scss/**/*.scss", buildStyles);
}

module.exports = {
  dev: gulp.parallel(watchStyles, runServer),
};
