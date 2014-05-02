// nodemain.js // this java script must be the first script tag in index.html */

if (typeof process !="undefined") {			// checking if node.js is running
	nodeRequire=require						// rename for later usage
	if (process.versions["node-webkit"]) {	// checking if nw is running
  		require("../node_scripts/watch.js")	// setup developing environment
	}
}