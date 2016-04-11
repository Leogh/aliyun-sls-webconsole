define(['webapp'], function (webapp) {

  var reservedFields = [
    'LogLevel',
    'LogTime',
    'LogMessage',
    'ip',
    'ProcessName',
    'LoggerName',
    'StackTrace',
    'Exception',
    '__source__',
    '__time__',
  ];
  
  webapp
    .directive('didaLogStruct', didaLogStruct);
  
  didaLogStructController.$inject = ['$scope', '$filter'];
    
  function didaLogStruct() {
    return {
      restrict: 'AE',
      scope: {
        doc: '=',
      },
      controller: didaLogStructController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: '/javascripts/directives/dida-log-struct.tpls.html'
    };
  }
  
  function didaLogStructController ($scope, $filter) {
    var vm = this;
    var brushFilter = $filter('brushfilter');
    var codeFilter = $filter('codefilter');
    var loglevelFilter = $filter('logLevel');
    
    vm.extraFields = [];    
    
    initDoc();
    
    angular.merge(vm, {
      getLogLevelLabelClass: getLogLevelLabelClass,
      getCodeBrush: getCodeBrush,
      getFormattedCode: getFormattedCode,
    });
    
    $scope.$watch('doc', function (newValue, oldValue) {
      if (!angular.equals(newValue, oldValue) && newValue) {
        initDoc();
      } 
    });
    
    function initDoc() {
      vm.extraFields = [];
      angular.forEach(vm.doc, function (value, key) {
        if (reservedFields.indexOf(key) < 0){
          vm.extraFields.push(key);
        }
      });
    }
    
    function getLogLevelLabelClass(level) {
      return loglevelFilter(level);
    }
    
    function getCodeBrush(code) {
      return brushFilter(code);
    }
    
    function getFormattedCode(code) {
      return codeFilter(code);
    }
  }
});