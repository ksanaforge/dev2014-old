/* this file must be first line in index.html script tag*/

if (typeof process !="undefined") {
	if (process.versions["node-webkit"]) {
  	require("../node_scripts/watch.js");
  }
  nodeRequire=require;
}