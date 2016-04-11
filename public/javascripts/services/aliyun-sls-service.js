define(['angular', 'webapp', 'utils/http-client'], function (angular, webapp) {
      
  webapp.factory('services.aliyun-sls-service', aliyunSLSService);
  
  aliyunSLSService.$inject = ['utils.http-client', '$q'];
  
  function aliyunSLSService(http, $q) {
    
    return {
      getLogStores: getLogStores,
      getTopics: getTopics,
      getHistograms: getHistograms,
      getLogs: getLogs,
    };
    
    function getLogStores(projectName) {
      return slsApiRequest({
        url: '/aliyun-sls/logstores',
        params: {
            projectName: projectName
        },
        method: 'GET',
      });
    }
    
    function getTopics(projectName, logStoreName) {
      return slsApiRequest({
        url: '/aliyun-sls/topics',
        params: {
            projectName: projectName,
            logStoreName: logStoreName,
        },
        method: 'GET',
      });
    }
    
    function getHistograms(projectName, logStoreName, topic, keyword, from, to) {
      return slsApiRequest({
        url: '/aliyun-sls/histograms',
        params: {
            projectName: projectName,
            logStoreName: logStoreName,
            topic: topic,
            from: from,
            to: to,
            keyword: keyword,
        },
      });
    }
    
    function getLogs(options) {
      return slsApiRequest({
        url: '/aliyun-sls/logs',
        params: {
            projectName: options.projectName,
            logStoreName: options.logStoreName,
            topic: options.topic,
            from: options.from,
            to: options.to,
            keyword: options.keyword,
            pageNum: options.page.pageNum,
            pageSize: options.page.pageSize,
        },
      });
    }
    
    function slsApiRequest(options) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      
      promise.success = function (callback) {
        promise.then(function (data) {
            callback(data.body, data.headers);
        });
        return promise;
      };
      
      promise.error = function (callback) {
        promise["catch"](function(arr){
            callback(arr[0], arr[1]);
        });
        return promise;
      };
      
      http
        .send(options)
        .success(function (data) {
            deferred.resolve(data);
        })
        .error(function (code, msg) {
            deferred.reject([code, msg]);
        });
      
      return promise;
    }
  }
});