/**
 * Created by Roman Lo on 5/19/2016.
 */

define(function (require, exports, module){
  "use strict";
  
  exports.genTimeRange = function (s, e) {
    var arr = [];
    for (var i = s; i <= e; i++) {
      var str = i.toString();
      if (i < 10) {
        str = '0' + str;
      }
      arr.push(str);
    }
    return arr;
  }

});