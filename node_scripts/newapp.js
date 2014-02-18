module.exports=function(appname){

	var fs=require('fs');
	var getgiturl=function() {
		var url=fs.readFileSync(appname+'/.git/config','utf8');//.match(/url = (.*?)\n/);
		url=url.substr(url.indexOf('url ='),100);
		url=url.replace(/\r\n/g,'\n').substring(6,url.indexOf('\n'));
		return url;
	}
	var die=function() {
		console.log.apply(this,arguments)
		process.exit(1);
	}


	if (!appname) die('Please specifiy --name=newappname');
	if (!fs.existsSync(appname)) die('folder not exists');
	if (!fs.existsSync(appname+'/.git')) die('not a git repository');

	
	var gitrepo=getgiturl().trim()||"";
	var componentjson=
'{\n'+
'  "name": "'+appname+'",\n'+
'  "repo": "'+gitrepo+'",\n'+
'  "description": "hello world",\n'+
'  "version": "0.0.1",\n'+
'  "keywords": [],\n'+
'  "dependencies": {\n'+
'    "ksanaforge/boot": "*",\n'+
'    "brighthas/bootstrap": "*",\n'+
'    "component/jquery": "*"\n'+
'  },\n'+
'  "development": {},\n'+
'  "paths": ["components","../components","../node_modules/"],\n'+
'  "local": ["facebook/react"],\n'+
'  "license": "MIT",\n'+
'  "main": "index.js",\n'+
'  "scripts": ["index.js"],\n'+
'  "styles": ["index.css"]\n'+
'}';

	var indexjs='var boot=require("boot");\nboot("'+appname+'","main","main");';
	var indexcss='#main {}';
	var indexhtml='<html>\n'+
						'<head>\n'+
						'<meta charset="utf-8" />\n'+
						'<script src="../nodemain.js"></script>\n'+
						'<link type="text/css" rel="stylesheet" href="build/build.css">\n'+
						'</head>\n'+
						'<div id="main"></div>\n'+
						'<script src="build/build.js"></script>\n'+
						'<script src="index.js"></script>\n'+
						'</html>';
	var packagejson='{\n'+
						'  "name": "'+appname+'",\n'+
						'  "description": "New application",\n'+
						'  "version": "0.0.1",\n'+
						'  "main": "index.html",\n'+
						'  "single-instance":true,\n'+
						'  "window": {\n'+
						'    "toolbar": true,\n'+
						'    "width": 1060,\n'+
						'    "height": 700\n'+
						'  },\n'+
						' "repositories": [\n'+
						'  {\n'+
						'            "type": "git", \n'+
						'            "url": "'+gitrepo+'"\n'+
						'       }  \n'+
						'    ]\n'+
						'}';
	var chromemain='chrome.app.runtime.onLaunched.addListener(function(launchData) {\n'+
  			'chrome.app.window.create("index.html", {id:"'+appname+'", bounds: {width: 800, height: 500}}, function(win) {\n'+
			'win.contentWindow.launchData = launchData;\n'+
			'});\n'+
			'});'

	//default gulpfile to prevent from using parent gulpfile
	var gulpfile="require('../gulpfile-app.js');";
	var manifestjson='{\n'+
		'"name": "'+appname+'",\n'+
		'"version": "0.1",\n'+
		'"manifest_version": 2,\n'+
		'"description": "'+appname+'",\n'+
		'"icons": { "16": "icons/icon16.png",\n'+
		'          "48": "icons/icon48.png",\n'+
       	'	    "128": "icons/icon128.png" },\n'+
    	'"app": {\n'+
		'	"background": {\n'+
		'	"scripts": ["chrome-main.js"]\n'+
		'	}\n'+
		'},\n'+
		'"permissions": [\n'+
		'"chrome://favicon/",\n'+
		'"clipboardRead",\n'+
		'"clipboardWrite",\n'+
		'"notifications",\n'+
		'{"fileSystem": ["write", "retainEntries", "directory"]},\n'+
		'"storage"\n'+
		']\n'+
		'}';

	fs.writeFileSync(appname+'/gulpfile.js',gulpfile,'utf8');
	fs.writeFileSync(appname+'/component.json',componentjson,'utf8');
	fs.writeFileSync(appname+'/index.js',indexjs,'utf8');
	fs.writeFileSync(appname+'/package.json',packagejson,'utf8');
	fs.writeFileSync(appname+'/index.css',indexcss,'utf8');
	fs.writeFileSync(appname+'/index.html',indexhtml,'utf8');
//	fs.writeFileSync(appname+'/chrome_main.js',indexhtml,'utf8'); //for chrome app
	fs.writeFileSync(appname+'/manifest.json',manifestjson,'utf8'); //for chrome app
	fs.mkdirSync(appname+'/components');
}