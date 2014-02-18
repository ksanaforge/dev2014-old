module.exports=function(name,opts) {
	opts=opts||{};
	if (!name) {
		throw 'empty name, please specify --name=optional_owner/component_name'
		return;
	}

	fs=require('fs')
	var appname=process.cwd().replace(/\\/g,'/');
	
	appname=appname.substring(appname.lastIndexOf('/')+1)
	console.log(appname)

	var foldername=name.replace('/','-');

	var splitted=name.match(/(.*?)\/(.*$)/);
	if (!splitted) {
		foldername=appname+'-'+name;
		componentname=name;
		name=appname+'/'+name;
	} else {
		componentname=splitted[2];
	}
	
	console.log('creating new component',foldername);
	var newfolder='components/'+foldername;
	fs.mkdirSync(newfolder);

	var indexjsx=
'/** @jsx React.DOM */\n\n'+
'//var othercomponent=Require("other"); \n'+
'var '+componentname+' = React.createClass({\n'+
'  getInitialState: function() {\n'+
'    return {bar: "world"};\n'+
'  },\n'+
'  render: function() {\n'+
'    return (\n'+
'      <div>\n'+
'        Hello,{this.state.bar}\n'+
'      </div>\n'+
'    );\n'+
'  }\n'+
'});\n'+
'module.exports='+componentname+';';

var componentjson=
'{\n'+
'  "name": "'+componentname+'",\n'+
'  "repo": "'+name+'",\n'+
'  "description": "hello world",\n'+
'  "version": "0.0.1",\n'+
'  "keywords": [],\n'+
'  "dependencies": {},\n'+
'  "development": {},\n'+
'  "license": "MIT",\n'+
'  "main": "index.js",\n'+
'  "scripts": ["index.js"],\n'+
'  "styles": ["index.css"]\n'+
'}';


var indexcss='.'+componentname+' {}';


	fs.writeFileSync(newfolder+'/index.jsx',indexjsx,'utf8');
	fs.writeFileSync(newfolder+'/index.css',indexcss,'utf8');
	fs.writeFileSync(newfolder+'/component.json',componentjson,'utf8');

/* add dependency to component.json*/
	var json=JSON.parse(fs.readFileSync('component.json','utf8'));
	json.dependencies[name]="*";
	fs.writeFileSync('component.json',JSON.stringify(json,'','  '),'utf8');
  
}