/**
 * Created by Roman Lo on 6/7/2016.
 */
define(['base'], function (Base) {

  var NotificationObserverGroup = function () {
    this.name = '';
    this.observers = [];
    this.status = 1;
  };

  NotificationObserverGroup.prototype = new Base();

  return NotificationObserverGroup;

});