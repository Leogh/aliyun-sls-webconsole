/**
 * Created by Roman Lo on 6/7/2016.
 */
define(['base'], function (Base) {

  var NotificationObserver = function () {
    this.name = '';
    this.realName = '';
    this.email = '';
    this.status = 1;
  };

  NotificationObserver.prototype = new Base();

  return NotificationObserver;

});