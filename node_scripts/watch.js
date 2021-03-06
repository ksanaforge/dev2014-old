// watch.js // 
nodeRequire=require // cannot be removed
var fs=nodeRequire('fs');
var gui = global.window.nwDispatcher.requireNwGui();
var sep=require('path').sep;
var file=process.cwd()+sep+'build'+sep+'build.js';

var watchFiles=function() {
  fs.watchFile(file, function (event, filename) {
	console.log('watching ',file,event)
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