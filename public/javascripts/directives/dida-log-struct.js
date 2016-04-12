define(['webapp'], function (webapp) {

  var reservedFields = [
    'LogLevel',
    'LogTime',
    'LogMessage',
    'IP',
    'ProcessName',
    'MachineName',
    'LoggerName',
    'StackTrace',
    'Exception',
    '__source__',
    '__time__',
  ];
  
  webapp
    .directive('didaLogStruct', didaLogStruct);
  
  didaLogStructController.$inject = ['$scope', '$filter', '$timeout'];
    
  function didaLogStruct() {
    return {
      restrict: 'AE',
      scope: {
        doc: '=',
      },
      controller: didaLogStructController,
      controllerAs: 'vm',
      link: link,
      bindToController: true,
      templateUrl: '/javascripts/directives/dida-log-struct.tpls.html',
    };
  }
  
  function link(scope, element, attrs){
    scope.highlightCode = function () {
      $('.code-container', element).each(function (index, container){
        var code = $('.codeblock', container).html();
        var preBlock = $('pre', container);
        preBlock.html(code);
        SyntaxHighlighter.highlight(undefined, preBlock[0]); 
      });
    };
  }
  
  function didaLogStructController ($scope, $filter, $timeout) {
    var vm = this;
    var brushFilter = $filter('brushFilter');
    var codeFilter = $filter('codeFilter');
    var loglevelFilter = $filter('logLevel');
    
    vm.extraFields = [];    
    
    initDoc();
    
    angular.merge(vm, {
      getLogLevelLabelClass: getLogLevelLabelClass,
      getCodeBrush: getCodeBrush,
      getFormattedCode: getFormattedCode,
      isEmpty: isEmpty,
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
      $timeout(function () {
        $scope.highlightCode();
      }, 0);
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
    
    function isEmpty(value) {
      if (typeof value === 'undefined') {
        return true;
      }
      return false;
    }
  }
});