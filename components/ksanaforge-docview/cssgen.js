var createStyleSheet=function() {
	var style = document.createElement("style");
	style.appendChild(document.createTextNode(""));
	document.head.appendChild(style);
	return style.sheet;
};
/*
	styles is a object mapping tagname with css rule
	tagset is tag used in the page, overlap tag are concat with ,
	use prefix to prepend all rules
*/
var insertRule=function(sheet,tags,prefix,SS) {
	var background_images=[]; 
	var combined=" ";
	for (var j=0;j<SS.length;j++) {
		var S=SS[j];
		for (k in S) {
			if (k==="background-image") {
				background_images.push(S[k]);
			} else {
				combined+=k+":"+S[k]+";";
			}
		}
	}
	if (background_images.length) {
		combined+='background-image:'+background_images.join(",");
	}
	var rule=prefix+"."+tags.join("__")+"{"+combined+"}";
	sheet.insertRule(rule,0);
}
var applyStyles=function(styles,tagset,prefix) {
	prefix=prefix||"";
	var sheet=document.styleSheets[1];
	if (!sheet) sheet=createStyleSheet() ;
	else { //remove all children
		while (sheet.firstChild) sheet.removeChild(sheet.firstChild);
	} 
	
	for (var i=0;i<tagset.length;i++) {
		var tags=tagset[i].split(",");
		var SS=[];
		for (var j in tags) {
			var s=styles[tags[j]]; 
			if (s) SS.push(s);
		}
		insertRule(sheet,tags,prefix,SS);
	}
}
var api={applyStyles:applyStyles};
module.exports=api;