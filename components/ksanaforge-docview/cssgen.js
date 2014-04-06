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
var applyStyles=function(styles,tagset,prefix) {
	prefix=prefix||"";
	var sheet=document.styleSheets[1];
	if (!sheet) sheet=createStyleSheet() ;
	else { //remove all children
		while (sheet.firstChild) sheet.removeChild(sheet.firstChild);
	}

	for (var i=0;i<tagset.length;i++) {
		var tags=tagset[i].split(",");
		var S=[];
		for (var j in tags) {
			var s=styles[tags[j]];
			if (s) S.push(s);
		}
		var rule=prefix+"."+tags.join("__")+" {background-image: "+ S.join(",") +"}";
		sheet.insertRule(rule,0);
	}
}
var api={applyStyles:applyStyles};
module.exports=api;