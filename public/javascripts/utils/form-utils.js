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

  exports.validateEmail = function (addr) {
    return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/
        .test(addr);
  }

});