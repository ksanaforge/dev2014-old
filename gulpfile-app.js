/*
	shared gulpfile for applications
*/
var gulp=require('gulp');
var newcomponent=require('./node_scripts/newcomponent');
gulp.task('newcomponent',function(){
	var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];
  newcomponent(name);
});

gulp.task('run',function(){

});

gulp.task('server',function(){

});

module.exports=gulp;