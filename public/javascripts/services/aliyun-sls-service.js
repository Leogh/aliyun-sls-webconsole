define(['angular', 'webapp', 'utils/http-client'], function (angular, webapp) {
      
  webapp.factory('services.aliyun-sls-service', aliyunSLSService);
  
  aliyunSLSService.$inject = ['utils.http-client', '$q'];
  
  function aliyunSLSService(http, $q) {
    
    return {
      getLogStores: getLogStores,
      getTopics: getTopics,
      getHistograms: getHistograms,
      getLogs: getLogs,
      favorProject: favorProject,
      getFavorProject: getFavorProject,
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
    
    function getHistograms(options, queryBuilder) {
      var query = options.keyword;
      if (typeof queryBuilder === 'function') {
          query = queryBuilder(options);
      }
      if (options.timeOptions.enabled) {
        initDateHours(options.from, options.timeOptions.from);
        initDateHours(options.to, options.timeOptions.to);
      }
      return slsApiRequest({
        url: '/aliyun-sls/histograms',
        params: {
          projectName: options.projectName,
          logStoreName: options.logStoreName,
          topic: options.topic,
          from: options.from,
          to: options.to,
          query: query,
          pageNum: options.page.pageNum,
          pageSize: options.page.pageSize,
        },
      });
    }
    
    function getLogs(options, queryBuilder) {
      var query = options.keyword;
      if (typeof queryBuilder === 'function') {
          query = queryBuilder(options);
      }
      if (options.timeOptions.enabled) {
        initDateHours(options.from, options.timeOptions.from);
        initDateHours(options.to, options.timeOptions.to);
      }
      return slsApiRequest({
        url: '/aliyun-sls/logs',
        params: {
          projectName: options.projectName,
          logStoreName: options.logStoreName,
          topic: options.topic,
          from: options.from,
          to: options.to,
          query: query,
          pageNum: options.page.pageNum,
          pageSize: options.page.pageSize,
        },
      });
    }
    
    function initDateHours(date, timeOption){
      date.setHours(parseInt(timeOption.h), parseInt(timeOption.m), parseInt(timeOption.s), 0);
    }
    
    
    function favorProject(projectName, isFavor) {
      return http.send({
        url: '/aliyun-sls/favor-project',
        params: {
          projectName: projectName,
          isFavor: isFavor,
        },
        method: 'put'
      });
    }
    
    function getFavorProject() {
      return http.send({
        url: '/aliyun-sls/favor-project',       
        method: 'get'
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