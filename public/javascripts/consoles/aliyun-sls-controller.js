define([
  'webapp',
  'services/aliyun-sls-service',
  'directives/dida-log-struct',
  'syntax-highlighter-brush-jscript',
  'syntax-highlighter-brush-xml',
  'vkbeautify',
], function(webapp) {
  
  // injections
  aliyunSLSController.$inject = ['$scope' , 'services.aliyun-sls-service', 'highchartsNG'];
  
  return webapp
    .controller('AliyunSLSController', aliyunSLSController)
    .filter('logLevel', logLevelFilter)
    .filter('brushFilter', brushFilter)
    .filter('codeFilter', codeFilter);
    
  // controller
  function aliyunSLSController($scope, slsService, highchartsNG) {
    var vm = this;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    var tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    
    vm.showChart = '0';
    vm.projectNameLocked = false;
    vm.projectReady = false;
    vm.levels = ['All', 'Debug', 'Info', 'Warn', 'Error', 'Fatal'];
    vm.hours = genTimeRange(0, 23);
    vm.minutes = genTimeRange(0, 59);
    vm.seconds = genTimeRange(0, 59);
    
    vm.projects = [];
    
    vm.logStores = [];
    
    vm.topics = [];
    
    vm.histograms = [];
    
    vm.logs = [];
    
    vm.chartConfig = {
      options: {
        chart: {
          type: 'spline',
        },
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          minute: '%H:%M',
          day: '%e. %b',
        },
        title: {
          text: 'log time'
        }
      },
      yAxis: {
        title: {
          text: 'log count',
        },
      },
      series: [{
        name: 'total log count',
        data: []
      }],
      title: '日志',
      loading: true,
    };
    
    vm._preSearchOption = {};
    vm.searchOptions = {      
      projectName: '',      
      logStoreName: null,
      topic: null,
      logLevel: 'All',
      keyword: '',
      from: today,
      to: tmr,
      timeOptions: {
        from: {
          h: '00',
          m: '00',
          s: '00',
        },
        to: {
          h: '00',
          m: '00',
          s: '00',
        },
        enabled: false,
      },
      page: {
        pageNum: 1,
        pageSize: 20,
        totalAmount: 0,
        pageCount: 0,
      },
    };
    
    // actions
    angular.merge(vm, {
      confirmProjectName: confirmProjectName,
      unlockProjectName: unlockProjectName,
      confirmLogStore: confirmLogStore,
      search: search
    });
    
    highchartsNG.ready(function () {
      
    }, this);
    
    return;
    
    function confirmProjectName() {
      vm.projectNameLocked = true;
      vm.projectReady = false;
      vm.logStores = [];
      vm.topics = [];    
      vm.histograms = [];
      vm.logs = [];
      vm.searchOptions.totalAmount = 0;
      initLogStores()
        .success(function () {
          vm.projectReady = true;
        })
        .error(function () {
          vm.projectNameLocked = false;
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
          alert('error: ' + msg);
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
      vm.logs = [];
      if (page > 0) {
        vm.searchOptions.page.pageNum = page;
      }
      loadHistograms()['finally'](function () {
        vm.chartConfig.loading = false;
        getLogs();
      });
    }
    
    function loadHistograms() {
      vm.chartConfig.series[0].data = [];
      vm.histograms = [];
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
          vm.searchOptions.page.totalAmount = parseInt(headers['x-log-count']);          
          var cnZoneOffset = 8 * 3600; // GMT+8:00
          var range = 0;
          angular.forEach(vm.histograms, function (item, idx) {
            if (idx == 0) {
              range = item.to - item.from;
            }
            var ticks = Math.floor((item.to - item.from) / 2) + item.from;            
            vm.chartConfig.series[0].data.push({
              x: (ticks + cnZoneOffset) * 1000,
              y: item.count
            });            
          });
          if (range > 0) {
            var unit = 'sec';
            var mod = 1;
            if (range > 60) {
              unit = 'min';
              mod = 60;
            }
            if (range > 3600) {
              unit = 'hr'
              mod = 3600;
            }
            vm.chartConfig.series[0].name = `Count range ${Math.ceil(range / mod)}${unit}`; 
          }
        })
        .error(function (code, msg) {
          console.error(code, msg);
          vm.searchOptions.page.totalAmount = 0;
          vm.searchOptions.page.pageNum = 1;
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
    
    function pageChange(){
      
    }
    
    function genTimeRange(s, e) {
      var arr = [];
      for(var i = s; i <= e; i++){
        var str = i.toString();
        if (i < 10) {
          str = '0' + str;
        }
        arr.push(str);
      }
      return arr;
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