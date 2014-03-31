var rpc=require('./rpc')
var makeinf=function(name) {
	return (
		function(opts,callback) {
			rpc.exec(callback,0,"yase",name,opts);
		});
}
var api={};
api.initialize=makeinf("initialize");
api.phraseSearch=makeinf("phraseSearch");
api.boolSearch=makeinf("boolSearch");
api.search=makeinf("search");
api.getText=makeinf("getText");
api.getTextByTag=makeinf("getTextByTag");
api.closestTag=makeinf("closestTag");
api.getTagAttr=makeinf("getTagAttr");
api.getTagInRange=makeinf("getTagInRange");
api.getTextRange=makeinf("getTextRange");
api.buildToc=makeinf("buildToc");
api.getTermVariants=makeinf("getTermVariants");

api.fillText=makeinf("fillText");
api.getRange=makeinf("getRange");
api.findTag=makeinf("findTag");
api.findTagBySelectors=makeinf("findTagBySelectors");
api.getRaw=makeinf("getRaw");
api.getBlob=makeinf("getBlob");
api.customfunc=makeinf("customfunc");
api.getTagInRange=makeinf("getTagInRange");
api.exist=makeinf("exist");
api.keyExists=makeinf("keyExists");
api.enumLocalYdb=makeinf("enumLocalYdb");
api.sameId=makeinf("sameId");
api.prepare=makeinf("prepare");

rpc.exec(function(err,data){
	api.version=data;
},0,"yase","version",{});


module.exports=api;
