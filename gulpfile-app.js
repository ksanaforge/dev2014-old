/*
	shared gulpfile for applications
*/
var newcomponent=require('./node_scripts/newcomponent');
var nw=require('./node_scripts/gulp-nw');
var paths = {
  buildscripts: [
  'components/**/*.{jsx,js}',
  '!build/*.js']
};
var tempjs=[];
var fs=require('fs')
var gulp=require('gulp');
var spawn=require('child_process').spawn;
var react = require('gulp-react');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var tap=require('gulp-tap');
var filelog=require('gulp-filelog');
var component=require('gulp-component');
var rename=require('gulp-rename');

gulp.task('newcomponent',function(){
	var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];
  newcomponent(name);
});


gulp.task('jsx2js',function() {
		return gulp.src(paths.buildscripts)
  		.pipe(tap(function(file, t) {
        if (file.path.substring(file.path.length-4) == '.jsx') {
            var jsfile=file.path.substring(0,file.path.length-1);
        		tempjs.push(jsfile);
            return t.through(react, []);
        }
    		}))
			.pipe(gulp.dest("components"));
});

gulp.task('componentbuild',['jsx2js'],function() {	
  return gulp.src('./component.json')
  .pipe(component({standalone: true}))
  .pipe(gulp.dest('./build'));
});

gulp.task('rebuild',['componentbuild'],function(){
  /* remove use strict in build.js 
     workaround for socketio not strict safe */
  var buildjs=fs.readFileSync('./build/build.js','utf8')
  var buildjs=buildjs.replace("'use strict';","// 'use strict'; // socketio is not strict safe");
  fs.writeFileSync('./build/build.js',buildjs,'utf8')

	tempjs.map(function(f){fs.unlink(f)});
  tempjs.length=0;
	return true;
})
gulp.task('watch', function () {
  gulp.watch(paths.buildscripts, ['rebuild']);
});

var appprocessexit=function() {
  process.exit(1);
}

gulp.task('run',['rebuild'],function(){
  var instance=spawn(nw.bin,['--remote-debugging-port=9222','.'])
  instance.on('exit',function(){
    appprocessexit();
  })
});


gulp.task('server',['rebuild'],function(){
  var instance=spawn("node",['../node_scripts/server'])

  instance.on('exit',function(){
    appprocessexit();
  });
  var appfolder=process.cwd().match(/[\/\\]([^\/\\]*?)$/)[1];
  console.log("your application can be accessed from ");
  console.log(("http://127.0.0.1:2556/"+appfolder));
});

gulp.task('min',['rebuild'],function(){
  return gulp.src('build/build.js').pipe(uglify()).
  pipe(rename('build.min.js')).pipe(gulp.dest('build'));
})
gulp.task('mkzip',['min'],function(){
  var mkzip=require('./node_scripts/mkzip');
  var appname=process.cwd();
  mkzip(appname);
})


gulp.task('default',['run','watch'])

module.exports=gulp;