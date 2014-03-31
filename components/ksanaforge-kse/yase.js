
var yase=function(){
  ksana.services={};
  var makeinf=function(name) {
      return function(opts,callback) {
              var data=ksana.services["yase"][name](opts);
              //this line is not really needed.
              setTimeout( function() { callback(0,data) }, 0);        
             //callback(0,data);
      }
  }  
  var makeprepare=function(opts) {
      return function(opts,callback) {
        ksana.services.yase.prepare(opts,function(err,data){
          callback(err,data);
        })
      };
  }

  if (ksana.platform=='node-webkit' || ksana.platform=='chrome') {
    /* compatible async interface for browser side js code*/
    if (ksana.platform=='node-webkit') {
      api_yadb=nodeRequire('yadb').api;
      api_yadb(ksana.services);
      var api_yase=nodeRequire('yase').api ; 
      api_yase(ksana.services); //install api into services
    } else {
      //do not export yadb
      var api_yadb=require('../yadb').api;
      api_yadb(ksana.services); //install api into services
      var api_yase=require('../yase').api ;
      api_yase(ksana.services); //install api into services
    }
    return { //turn into async, for compatible with node_server
        phraseSearch: makeinf('phraseSearch'),
        boolSearch: makeinf('boolSearch'),
        search: makeinf('search'),
        getTermVariants: makeinf('getTermVariants'),
        getText: makeinf('getText'),
        getTextByTag: makeinf('getTextByTag'),
        getTextRange:makeinf('getTextRange'),
        getTagInRange: makeinf('getTagInRange'),
        closestTag: makeinf('closestTag'),
        buildToc: makeinf('buildToc'),
        getTagAttr: makeinf('getTagAttr'),
        fillText: makeinf('fillText'),
        getRange: makeinf('getRange'),
        getRaw: makeinf('getRaw'),
        getBlob: makeinf('getBlob'),
        findTag: makeinf('findTag'),
        expandToken: makeinf('expandToken'),
        
        findTagBySelectors: makeinf('findTagBySelectors'),
        exist: makeinf('exist'),
        keyExists: makeinf('keyExists'),
        customfunc: makeinf('customfunc'),
       // version: services["yase"].version(),

        enumLocalYdb:makeinf('enumLocalYdb'),
        sameId:makeinf('sameId'),
        prepare:makeprepare()
    };  

  } else {
    //for node_server , use socket.io to talk to server-side yase_api.js
    return require('./rpc_yase');
  }
}

module.exports=yase();