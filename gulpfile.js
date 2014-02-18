// settings
var nw=require('./node_scripts/gulp-nw');
var repos=require('./node_scripts/repos');

//third party
var gulp = require('gulp'); 
var https = require('https');
var fs = require('fs');
var fstream=require('fstream');
var unzip=require('unzip');
var clean = require('gulp-clean');
var spawn = require('child_process').spawn;
var exec= require('child_process').exec;

var outback = function (s) {
    while (s.length < 70) s += ' ';
    var l = s.length; 
    for (var i = 0; i < l; i++) s += String.fromCharCode(8);
    process.stdout.write(s);
}
gulp.task('install-node-webkit', function() {
	if (!fs.existsSync(nw.path)) fs.mkdirSync(nw.path);
	var writeStream = fstream.Writer(nw.path);
	var datalength=0;
	var request = https.get(nw.url, function(response) {
		response.on('data',function(chunk){
			datalength+=chunk.length;
			outback('downloading '+datalength);
		});
		response.pipe(unzip.Parse())
		.pipe(writeStream);
	});
});

gulp.task('clonerepos',function() {
	for (var i in repos) {
		gulp.src(repos[i].target,{read:false}).pipe(clean());
		spawn('git', ["clone",repos[i].url,repos[i].target]);
	}
});

gulp.task('install-socket.io-cli',function() {
	gulp.src('node_modules/socket.io/node_modules/socket.io-client/dist/*')
  .pipe(gulp.dest('components/socketio-socketio/'));
  
})
gulp.task('component-install',function(){
	exec('component install');
})
gulp.task('setup', ['install-socket.io-cli','component-install']);
//grunt.registerTask('setup',['install-node-webkit','clone','shell:component-install','copy:socketio-cli','welcome'])


var newapp=require('./node_scripts/newapp');
var newcomponent=require('./node_scripts/newcomponent');
gulp.task('newapp',function(){
	var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];
  newapp(name);
  process.chdir(name);
  newcomponent(name+'/main');
  newcomponent(name+'/comp1'); //need at least 2 component for gulp to work properly
  process.chdir('..');
  console.log('success, switch to app folder and type')
  console.log('grunt run')
});

