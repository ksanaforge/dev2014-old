var rpc=require('./rpc')
var makeinf=function(name) {
	return (
		function(opts,callback) {
			rpc.exec(callback,0,"document",name,opts);
		});
}
var api={};

api.enumProject=makeinf("enumProject");
api.getProjectFolders=makeinf("getProjectFolders");
api.getProjectFiles=makeinf("getProjectFiles");
api.openDocument=makeinf("openDocument");
api.saveMarkup=makeinf("saveMarkup");
api.saveDocument=makeinf("saveDocument");
api.getUserSettings=makeinf("getUserSettings");
api.login=makeinf("login");

rpc.exec(function(err,data){
	api.version=data;
},0,"document","version",{});


module.exports=api;
