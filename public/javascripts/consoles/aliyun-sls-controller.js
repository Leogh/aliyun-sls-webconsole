define([
  'webapp',
  'services/aliyun-sls-service',
  'directives/dida-log-struct',
  'syntax-highlighter-brush-jsscript',
  'syntax-highlighter-brush-xml',
  'vkbeautify',
], function(webapp) {
  
  // injections
  aliyunSLSController.$inject = ['$scope' , 'services.aliyun-sls-service'];
  
  return webapp
    .controller('AliyunSLSController', aliyunSLSController)
    .filter('logLevel', logLevelFilter)
    .filter('brushFilter', brushFilter)
    .filter('codeFilter', codeFilter);
    
  // controller
  function aliyunSLSController($scope, slsService) {
    var vm = this;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        
    vm.projectNameLocked = false;
    vm.projectReady = false;
    
    vm.projects = [];
    
    vm.logStores = [];
    
    vm.topics = [];
    
    vm.histograms = [];
    vm.logCount = 0;
    
    vm.logs = [];
    
    vm._preSearchOption = {};
    vm.searchOptions = {      
      projectName: '',      
      logStoreName: null,
      topic: null,
      keyword: '',
      from: today,
      to: now,
      page: {
        pageNum: 1,
        pageSize: 20,
      },
    };
    
    // actions
    angular.merge(vm, {
      confirmProjectName: confirmProjectName,
      unlockProjectName: unlockProjectName,
      confirmLogStore: confirmLogStore,
      search: search,
    });
    
    return;
    
    function confirmProjectName() {
      vm.projectNameLocked = true;
      vm.projectReady = false;
      vm.logStores = [];
      vm.topics = [];
      initLogStores()
        .success(function () {
          vm.projectReady = true;
        })
        .error(function () {
          vm.projectReady = false;
        });
    }
    
    function unlockProjectName() {
      vm.projectNameLocked = false;
    }
    
    function initLogStores() {
      return slsService
        .getLogStores(vm.searchOptions.projectName)
        .success(function (body, headers) {
          vm.logStores = body.logstores;
          if (body.count > 0) {
            vm.searchOptions.logStoreName = vm.logStores[0];
            confirmLogStore();
          }
        })
        .error(function (code, msg) {
          console.error(code, msg);
        });
    }
    
    function confirmLogStore() {
      initTopics();
    }
    
    function initTopics() {
      vm.topics = [];
      return slsService
        .getTopics(vm.searchOptions.projectName, vm.searchOptions.logStoreName)
        .success(function (body, headers) {
          angular.forEach(body, function (topic, id) {
            vm.topics.push(topic);
          });
          if (vm.topics.length > 0) {
            vm.searchOptions.topic = vm.topics[0];
          }
        })
        .error(function (code, msg) {
          console.error(code, msg);
        });
    }
    
    function search(page) {
      // TODO: implementations
      vm.logs = [];
      loadHistograms()['finally'](function () {
        getLogs();
      });
    }
    
    function loadHistograms() {
      vm.histograms = [];
      vm.logCount = 0;
      return slsService
        .getHistograms(
          vm.searchOptions.projectName, 
          vm.searchOptions.logStoreName,
          vm.searchOptions.topic,
          vm.searchOptions.keyword,
          vm.searchOptions.from,
          vm.searchOptions.to)
        .success(function (body, headers){
          vm.histograms = body;
          vm.logCount = headers['x-log-count'];          
        })
        .error(function (code, msg) {
          console.error(code, msg);
        });        
    }
    
    function getLogs() {
      vm.logs = [];
      return slsService
        .getLogs(vm.searchOptions)
        .success(function (body, headers){
          vm.logs = body;
        })
        .error(function (code, msg) {
          console.error(code, msg);
        });       
    }
  }

  // filter
  function logLevelFilter() {    
    return function (level) {
      switch(parseInt(level)){
        case 0: return 'label-primary';
        case 1: return 'label-info';
        case 2: return 'label-warning';
        case 3: return 'label-danger';
      }
      if (level == 'Debug') {
        return 'label-primary';
      } else if (level == 'Info') {
        return 'label-info';
      } else if (level == 'Warn') {
        return 'label-warning';
      } else if (level == 'Error') {
        return 'label-danger';
      }
      return 'label-default';
    };
  }
  
  function brushFilter () {
    return function (text) {
      if (text == null || typeof text === 'undefined' || text.length == 0) {
        return 'brush: js';
      }
      if (/^{[\w\W\s\S]*\}$/.test(text)) {
        return 'brush: js';
      }
      return 'brush: xml';
    };
  }
  
  function codeFilter () {
    return function (text) {
      if (text == null || typeof text === 'undefined' || text.length == 0) {
        return text;
      }  
      if (/^{[\w\W\s\S]*\}$/.test(text)) {
        return processJson(text);
      }
      return processXml(text);
    };
  }
  
  function processJson(data) {
    return vkbeautify.json(data, 2);
  }

  function processXml(data) {
    data = data.replace(/\\"/g, '"');
    data = data.replace(/\\r\\n/g, "");
    data = data.substr(1, data.length - 2);
    return vkbeautify.xml(data, 2);
  }
  
});