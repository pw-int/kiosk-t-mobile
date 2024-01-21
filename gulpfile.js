"use strict";

/* paths configuration */
var path = {
    build: {
        html: "./dist/",
        js: "./dist/js/",
        css: "./dist/css/",
        img: "./dist/img/",
        fonts: "./dist/fonts/",
        fontIcons: "./dist/fonts/",
        external: "./dist/external/"
    },
    src: {
        html: "./src/*.html",
        js: ["./src/js/main.js"],
        style: "./src/style/main.scss",
        fontIcons: "./src/font_icons/icons/*.svg",
        external: "./src/external/**/*.*",
        img: [
            "./src/img/**/*.*",
        ],
        fonts: [
            "./src/fonts/**/*.*",
        ]
    },
    watch: {
        html: "./src/**/*.html",
        js: "./src/js/**/*.js",
        css: "./src/style/**/*.scss",
        img: "./src/img/**/*.*",
        fonts: "./srs/fonts/**/*.*",
        external: "./src/external/**/*.*",
        fontIcons: "./src/font_icons/icons/*.svg",
    },
    clean: "./dist/*",
};

/* Web server config */
var config = {
    server: {
        baseDir: "./dist",
    },
    notify: false,
};

/* Gulp config */
const sass = require('gulp-sass')(require('sass'));
const gulp = require("gulp"),
    minify = require("gulp-minify"),
    webserver = require("browser-sync"),
    plumber = require("gulp-plumber"),
    rigger = require("gulp-rigger"),
    sourcemaps = require("gulp-sourcemaps"),
    autoprefixer = require("gulp-autoprefixer"),
    cleanCSS = require("gulp-clean-css"),
    cache = require("gulp-cache"),
    rimraf = require("gulp-rimraf"),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    rename = require("gulp-rename"),
    rtlcss = require('gulp-rtlcss');

/* Main tasks */

/**
 * Start a web server
 */
gulp.task("webserver", function() {
    webserver(config);
});

/**
 * Build html
 */
gulp.task("html:build", function() {
    return gulp
        .src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({ stream: true }));
});

/**
 * Builds the svg icons to font
 */
gulp.task('fonticons:build', function() {
    const fontName = 'IconsFont';
    return gulp.src([path.src.fontIcons])
        .pipe(iconfontCss({
            fontName: fontName,
            path: './src/font_icons/templates/_icons.scss',
            targetPath: '../../src/style/theme/_icons.scss',
            fontPath: '../fonts/'
        }))
        .pipe(iconfont({
            fontName: fontName,
            fontHeight: 2000,
            centerVertically: true,
            normalize: true,
            formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
        }))
        .pipe(gulp.dest(path.build.fontIcons));
});


/**
 * Build styles
 */
gulp.task("css:build-ltr", function() {
    return gulp
        .src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass({
            includePaths: [
                './node_modules',
            ]
        })) // scss -> css
        .pipe(autoprefixer())
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: ".min" }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.build.css));
});

gulp.task("css:build-rtl", function() {
    return gulp
        .src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass({
            includePaths: [
                './node_modules',
            ]
        })) // scss -> css
        .pipe(rtlcss())
        .pipe(rename({ suffix: ".rtl" }))
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: ".min" }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true }));
});

gulp.task("css:build", gulp.series(gulp.parallel("css:build-ltr", "css:build-rtl")));


/**
 * Build js
 */
gulp.task("js:build", function() {
    return gulp
        .src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(sourcemaps.init())
        .pipe(
            minify({
                ext: {
                    min: ".min.js",
                },
                ignoreFiles: ["-min.js"],
            })
        )
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({ stream: true }));
});

/**
 * Copy fonts
 */
gulp.task("fonts:build", function() {
    return gulp
        .src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

/**
 * Process images
 */
gulp.task("image:build", function() {
    return gulp
        .src(path.src.img)
        .pipe(gulp.dest(path.build.img));
});

/**
 * Process external files
 */
gulp.task("external:build", function() {
    return gulp
        .src(path.src.external)
        .pipe(gulp.dest(path.build.external));
});

/**
 * Clean build
 */
gulp.task("clean:build", function() {
    return gulp.src(path.clean, { read: false }).pipe(rimraf());
});

/**
 * Clean the cache
 */
gulp.task("cache:clear", function() {
    cache.clearAll();
});

/**
 * Main build task
 */
gulp.task(
    "build",
    gulp.series(
        "clean:build",
        gulp.parallel(
            "html:build",
            "css:build",
            "js:build",
            "fonts:build",
            "image:build",
            "fonticons:build",
            "external:build",
        )
    )
);

/**
 * Watch task
 */
gulp.task("watch", function() {
    gulp.watch(path.watch.html, gulp.series("html:build"));
    gulp.watch(path.watch.css, gulp.series("css:build"));
    gulp.watch(path.watch.js, gulp.series("js:build"));
    gulp.watch(path.watch.img, gulp.series("image:build"));
    gulp.watch(path.watch.fonts, gulp.series("fonts:build"));
    gulp.watch(path.watch.fontIcons, gulp.series("fonticons:build"));
    gulp.watch(path.watch.external, gulp.series("external:build"));
});

/**
 * Default task
 */
gulp.task("default", gulp.series("build", gulp.parallel("webserver", "watch")));