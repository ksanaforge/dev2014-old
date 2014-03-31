var useDB=function(db,callback) {
	//chrome doesn't allow new Function()
	var customfunc=null;
  if (ksana.platform=='chrome') customfunc=Require(ksana.appId+'/sample.js');
  db=this.state.db;
  if (ksana.platform=='remote') db=ksana.appId+"/"+db;
  this.$yase("prepare",{db:db,customfunc:customfunc})
    .done(function(data) {
    	callback.apply(this,[data]);
  });
} 


module.exports={yase:require('./yase'), $yase:require("./yase_promise"),
useDB:useDB}
