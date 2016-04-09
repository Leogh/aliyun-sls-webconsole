// require js configuration
requirejs.config({
  // locating the path of the 3rd party libraries
  // loading components from cdn, you may change the component url according to your own project.
  paths: {
    "jquery": "//cdn.bootcss.com/jquery/2.1.2/jquery.min", //"libs/jquery/dist/jquery.min",
    "bootstrap": "//cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min", //"libs/bootstrap/dist/js/bootstrap.min",
    "angular": "//cdn.bootcss.com/angular.js/1.5.0/angular.min", //"libs/angular/angular.min",
    "angular-animate": "//cdn.bootcss.com/angular.js/1.5.0/angular-animate.min", // "libs/angular-animate/angular-animate.min",
    "angular-sanitize": "//cdn.bootcss.com/angular.js/1.5.0/angular-sanitize.min", //"libs/angular-sanitize/angular-sanitize.min",
    //"angular-bootstrap": "../libs/angular-bootstrap/ui-bootstrap.min",
    "angular-bootstrap-tpls": "libs/angular-bootstrap/ui-bootstrap-tpls.min",
    "text": "libs/text/text",
  },
  // defining shim
  shim: {
    'jquery': {
      'exports': 'jquery'
    },
    'angular': {
      'exports': 'angular'
    },
    'angular-sanitize': ['angular'],
    "angular-animate": ['angular'],
    'bootstrap': ['jquery'],
    'angular-bootstrap-tpls': ['bootstrap', 'angular'],
    //'angular-bootstrap': ['bootstrap', 'angular-bootstrap-tpls']
  },

  // config text
  config: {
    text: {
      useXhr: function (url, protocol, hostname, port) {
        //Override function for determining if XHR should be used.
        //url: the URL being requested
        //protocol: protocol of page text.js is running on
        //hostname: hostname of page text.js is running on
        //port: port of page text.js is running on
        //Use protocol, hostname, and port to compare against the url
        //being requested.
        //Return true or false. true means "use xhr", false means
        //"fetch the .js version of this resource".
        return true;
      }
    }
  }
  // disable cache, debug mode only
  // urlArgs: "bust=" + (new Date()).getTime()
});