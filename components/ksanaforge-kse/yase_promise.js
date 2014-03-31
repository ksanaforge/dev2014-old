var $=require('../jquery');
var yase=require('./yase');
var $yase=function(api,opts) {
    if (typeof yase[api]!=='function') {
      throw api+' not found';
      return;
    }
    var deferred = new $.Deferred();
    var promise=deferred.promise();
    var that=this;

    yase[api](opts,function(err,data){
      if (err) deferred.fail(err);
      else deferred.resolveWith(that,[data]);
      deferred.always(err);
    });

    return promise;
};
module.exports=$yase;