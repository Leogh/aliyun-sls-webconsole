define([
  'webapp'
], function(webapp) {

  return webapp
    .controller('AliyunSLSController', ['$scope', aliyunSLSController])

  function aliyunSLSController($scope) {
    var vm = this;

    vm.searchOptions = {

      confirmProjectName: confirmProjectName,
    };


    function confirmProjectName() {
      // TODO: implementations
    }
  }

});