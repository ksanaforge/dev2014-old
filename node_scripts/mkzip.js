/*
	create stand-alone deployable zip, without any dependency.
*/
var fs=require('fs');
var path=require('path');
var shellscript={
	'win32':'.cmd',
	'darwin':'.command',
	'linux':'.sh'
}
var eol={
	'win32':'\r\n',
	'darwin':'\n',
	'linux':'\r'
}
var nwpath={
	'win32':'win-ia32',
	'darwin':'osx-ia32',
	'linux':'linux-ia32'	
}
var platform=process.platform;

var ZipWriter = require("./zipwriter").ZipWriter;
var zip = new ZipWriter();
var walk = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) {
			if (file.substring(file.length-4)!='test') {
				results = results.concat(walk(file))
			} else {
				console.log('skip '+file)
			}
        } 
        else results.push(file)
    })
    return results
}
var addfile=function(f,addtoroot) {
	if (f.indexOf(".git")>-1 || f.indexOf(".bak")>-1  || f.indexOf(".log")>-1) {
//		console.log('skip',f);
		return;
	}
	console.log('add ',f);	
	var target=f;
	if (addtoroot) target=f.split('/').pop();
	zip.addFile(target,f);
}
var addtozip=function(files,addtoroot) {
	for (var i in files) {
		var file=files[i];
		if (!fs.existsSync(file)) throw 'not exist '+file;

		var stats=fs.lstatSync(file);
		if (stats.isDirectory()) {
			var folderfiles=walk(file);
			for (var j in folderfiles) {
				addfile(folderfiles[j],addtoroot);
			}
		} else {
			addfile(file,addtoroot);
		}
	}
}


var indexhtml='<html>\n<head>\n<meta charset="utf-8" />\n'+
						'<link type="text/css" rel="stylesheet" href="build.css"></head>\n'+
						'<div id="main"></div>\n'+
						'<script>window.nodeRequire=require;</script>\n'+
						'<script src="build.min.js"></script>\n'+
						'</html>';
var add_appfiles=function(appfolder,zip) {
	zip.addData("index.html",indexhtml);
	addfile(appfolder+"/index.css",true);
	addfile(appfolder+"/package.json",true);
	addfile(appfolder+"/build/build.min.js",true);
	addfile(appfolder+"/build/build.css",true);

	if (fs.existsSync(appfolder+"/mkzip.json")){
		var deploy=require("../"+appfolder+"/mkzip.json");
		if (deploy.files) addtozip(deploy.files , true);
		//array of node modules 
		//['node_modules/yadb','node_modules/yase']
		if (deploy.repos) addtozip(deploy.repos);
	} 
}

var add_node_webkit=function() {
	addtozip(['node_webkit/'+nwpath[platform]],true);
	
}
/*
  change package.json to "main": "../../cst/index.html",
  and put in node-webkit exe folder
*/
var mkzip=function(appfolder) {
	var starttime=new Date();

	var date =new Date().toISOString().substring(0,10);
	var folders=appfolder.split(path.sep);
	var appname=folders[folders.length-1];
	
//	var shellscriptname='start-'+appname + shellscript[platform];
	//create 
	process.chdir("..");
	add_appfiles(appname,zip);
	add_node_webkit();

	console.log("");
	console.log('.....Creating Zip file.....')
	var zipname=appname +'-'+platform+'-'+date+'.zip';
	zip.saveAs(zipname,function() {
	   console.log('time elapsed in seconds', Math.round(new Date()-starttime)/1000);
	   console.log("zip file created: ");
	   console.log(zipname);
	   process.chdir(appfolder);
	});
	
}


module.exports=mkzip;