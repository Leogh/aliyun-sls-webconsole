define(['angular', 'webapp'], function (angular, webapp) {

  var HTTP_REQUEST_METHODS = {
    GET: 'GET',
    POST: 'POST'
  };

  var DEFAULT_CONFIG = {
    method: HTTP_REQUEST_METHODS.GET,
    timeout: 60000
  };

  var injectParams = ['$http', '$q'];

  var HttpClient = function ($http, $q) {

    var _methods = {
      _send_request: function (config) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        var conf = angular.extend({}, DEFAULT_CONFIG, config);

        promise.success = function (successCb) {
          promise.then(function (stdMdl) {
            successCb(stdMdl.data);
          });
          return promise;
        };

        promise.error = function (errorCb) {
          promise["catch"](function (stdMdl) {
            errorCb(stdMdl.code, stdMdl.msg);
          });
          return promise;
        };

        $http(conf).success(onHttpSuccess).error(onHttpError);

        return promise;

        function onHttpSuccess(result, status) {
          if (typeof result !== 'object') {
            deferred.reject({});
            return;
          }
          if (result.success) {
            var isOkay = typeof result.data !== 'undefined';
            (isOkay ? deferred.resolve : deferred.reject)(angular.merge(result, isOkay ? {} : {
              code: 0, msg: 'Invalid response: property Data is missing.'
            }));
          } else {
            var mCode = typeof result.code === 'undefined';
            var mMsg = typeof result.msg === 'undefined';
            angular.extend(result, mCode ? {
              code: 0, msg: 'Invalid response: property MessageCode is missing.'
            } : mMsg ? {
              code: 0, msg: 'Invalid response: property Message is missing.'
            } : {});
            deferred.reject(result);
          }
        }

        function onHttpError(result, status) {
          if (typeof result === 'undefined' && typeof status === 'undefined') {
            status = -1;
            result = 'Invalid request: resouces not found or network issue.';
          }
          deferred.reject({
            code: status,
            msg: result
          });
        }

      }
    }

    this.get = function (url, param) {
      return _methods._send_request({
        url: url,
        param: param,
        method: HTTP_REQUEST_METHODS.GET
      });
    };

    this.post = function (url, data) {
      return _methods._send_request({
        url: url,
        data: data,
        method: HTTP_REQUEST_METHODS.POST
      });
    };

    this.send = function (config) {
      return _methods._send_request(config);
    };

    this.Methods = angular.extend({}, HTTP_REQUEST_METHODS);

    this.DefaultConfig = angular.extend({}, DEFAULT_CONFIG);
  }

  HttpClient.Methods = angular.extend({}, HTTP_REQUEST_METHODS);
  HttpClient.DefaultConfig = angular.extend({}, DEFAULT_CONFIG);

  HttpClient.$inject = injectParams;

  webapp.service('utils.http-client', HttpClient);

});