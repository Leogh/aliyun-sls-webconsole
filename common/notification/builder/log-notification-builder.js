/**
 * Created by Roman Lo on 6/1/2016.
 */

var NotificationBuilderBase = require('./notification-builder-base');

var LogNotificationBuilder = function () {

};

LogNotificationBuilder.prototype = Object.create(NotificationBuilderBase.prototype, {
  build: {
    value: function () {
      // console.log(this instanceof  NotificationBuilderBase, this instanceof  LogNotificationBuilder);
      // TODO: build notification data
      return null;
    },
    enumerable: true,
    configurable: true,
    writable: true
  }
});

module.exports = LogNotificationBuilder;
