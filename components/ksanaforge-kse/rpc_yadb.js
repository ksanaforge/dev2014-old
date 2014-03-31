var rpc=require('./rpc')
var makeinf=function(name) {
	return (
		function(opts,callback) {
			rpc.exec(callback,0,"yadb",name,opts);
		});
}

var api={};
api.getRaw=makeinf("getRaw");
api.closeAll=makeinf("closeAll");
//api.writeFile=writeFile;
api.initialize=makeinf("initialize");
rpc.exec(function(err,data){
	console.log('version',err,data)
	api.version=data;
},0,"yadb","version",{});


module.exports=api;
