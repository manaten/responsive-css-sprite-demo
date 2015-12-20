import gulp from 'gulp';
import gulpUtil from 'gulp-util';
import mergeStream from 'merge-stream';

import jade from 'gulp-jade';
import stylus from 'gulp-stylus';
import autoprefixer from 'gulp-autoprefixer';
import minifycss from 'gulp-minify-css';
import spritesmith from 'gulp.spritesmith';
import webserver from 'gulp-webserver';


const SRC_DIR = 'src';
const BUILD_DIR = 'build';
const TMP_DIR = 'tmp';

function onError(err) {
  gulpUtil.log(err.message);
  this.emit('end');
}

// jade -> html
gulp.task('build:html', () =>
  gulp.src(`${SRC_DIR}/**/*.jade`)
    .pipe(jade())
    .on('error', onError)
    .pipe(gulp.dest(BUILD_DIR))
);

// stylus -> css
gulp.task('build:css', ['build:sprite'], () => {
  return gulp.src(`${SRC_DIR}/css/main.styl`)
    .pipe(stylus({
      include : [`${TMP_DIR}/css`],
      compress: true
    }))
    .on('error', onError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions', '> 1%'],
      cascade : false
    }))
    .on('error', onError)
    .pipe(minifycss())
    .pipe(gulp.dest(`${BUILD_DIR}/css`));
});

// images -> sprite image
gulp.task('build:sprite', () => {
  const spriteData = gulp.src(`${SRC_DIR}/sprites/**/*.png`)
    .pipe(spritesmith({
      imgName  : 'sprite.png',
      cssName  : 'sprite.styl',
      imgPath  : '/assets/sprite.png',
      cssFormat: 'stylus',
      cssVarMap: sprite => {
        sprite.name = 'sprite-' + sprite.name;
      }
    }))
    .on('error', onError);
  return mergeStream(
    spriteData.img.pipe(gulp.dest(`${BUILD_DIR}/assets`)),
    spriteData.css.pipe(gulp.dest(`${TMP_DIR}/css`))
  );
});

gulp.task('webserver', ['build:html'], () =>
  gulp.src(BUILD_DIR)
    .pipe(webserver({
      directoryListing: false,
      open            : false,
      host            : '0.0.0.0',
      port            : 8080,
      fallback        : 'index.html'
    }))
);

gulp.task('build', ['build:html', 'build:css']);
gulp.task('watch', ['webserver', 'build'], () => {
  gulp.watch([`${SRC_DIR}/sprites/**/*`], ['build:css']);
  gulp.watch([`${SRC_DIR}/css/**/*`], ['build:css']);
  gulp.watch([`${SRC_DIR}/**/*.jade`], ['build:html']);
});
