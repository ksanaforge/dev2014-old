/* this file must be first line in index.html script tag*/

if (typeof process !="undefined") {			// checking if node.js
  	nodeRequire=require;					// require will be redefined
	if (process.versions["node-webkit"]) {	// checking if nw
  	require("../node_scripts/watch.js");	// developing env
  }
}