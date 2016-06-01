/**
 * Created by Roman Lo on 6/1/2016.
 */

//var emailConfig = require('json-config-ext').config.provider.email;
var NotificationProviderBase = require('./notification-provider-base');

var EmailNotificationProvider = function () {
};

EmailNotificationProvider.prototype = Object.create(NotificationProviderBase.prototype, {
  notify: {
    value: function (content, observer) {
      // console.log(`sending notification to ${observer.name}`, observer.email, content);
      // TODO: send email
      return false;
    },
    enumerable: true,
    configurable: true,
    writable: true
  }
});




module.exports = EmailNotificationProvider;
