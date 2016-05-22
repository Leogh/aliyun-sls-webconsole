/**
 * Created by roman on 4/28/16.
 */
define(['base'], function (Base) {

  var AnalyticsFieldFilter = function () {
    this.name = '';
    this.interpretations = [];
    this.createTime = new Date();
    this.status = 1;
  };

  AnalyticsFieldFilter.prototype = new Base();

  return AnalyticsFieldFilter;

});