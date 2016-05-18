/**
 * Created by roman on 4/28/16.
 */
define(['base'], function (Base) {

  var AnalyticsField = function () {
    this.name = '';
    this.filterName = '';
    this.valueSet = [];
    this.createTime = new Date();
    this.status = 1;
  };

  AnalyticsField.prototype = new Base();

  return AnalyticsField;

});