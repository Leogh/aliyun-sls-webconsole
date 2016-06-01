/**
 * Created by Roman Lo on 6/1/2016.
 */

var NotificationProviderBase = function () {
  throw Error('NotificationProviderBase is an abstract class. You should extends it.')
};

NotificationProviderBase.prototype = {
  notify: function (content, target) {
    throw Error('notification provider should implement the execute method');
  }
};

module.exports = NotificationProviderBase;