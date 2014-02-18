var nodeRequire=require;
var fs=nodeRequire('fs');
var gui = global.window.nwDispatcher.requireNwGui();
var sep=require('path').sep;
var file=process.cwd()+sep+'build'+sep+'build.js';

var watchFiles=function() {
	console.log('watching ',file)
  fs.watchFile(file, function (event, filename) {
    if (filename) reload();
  });
}
watchFiles();

var unwatchFiles=function() {
  fs.unwatchFile(file);
}

var reload=function(){
  var win = gui.Window.get();
	gui.App.clearCache();
	win.reload();
}

gui.Window.get().on('close', function(){
   unwatchFiles();
   gui.App.quit();
});