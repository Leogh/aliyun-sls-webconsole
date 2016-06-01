/**
 * Created by Roman Lo on 6/1/2016.
 */

var NotificationBuilderBase = function () {
  
};


NotificationBuilderBase.prototype = {
  build : function () {
    throw Error('notification builder should implement the build method');
  }
};

module.exports = NotificationBuilderBase;