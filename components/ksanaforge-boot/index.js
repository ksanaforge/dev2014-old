var ksana={"platform":"remote"};

if (typeof process !="undefined") {
	if (process.versions["node-webkit"]) {
  	ksana.platform="node-webkit"
  }
} else if (typeof chrome!="undefined" && chrome.fileSystem){
	ksana.platform="chrome";
}

var React=require('../react');
//require("../cortex");
var Require=function(arg){return require("../"+arg)};
var boot=function(appId,main,maindiv) {
	main=main||"main";
	maindiv=maindiv||"main";
	ksana.appId=appId;

	ksana.mainComponent=React.renderComponent(Require(main)(),document.getElementById(maindiv));	
}
window.React=React;
window.ksana=ksana;
window.Require=Require;
module.exports=boot;