/**
 * Created by Roman Lo on 8/15/2016.
 */
var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");


module.exports = function (router) {
  /*
   Notification Rule
   */
  router.get('/pool-config', utils.authChk('/login'), function (req, res) {

  });

  router.post('/pool-config', utils.authChk('/login'), function (req, res) {

  });

  router.put('/pool-config', utils.authChk('/login'), function (req, res) {

  });

  router.delete('/pool-config', utils.authChk('/login'), function (req, res) {

  });

  router.post('/exec', utils.authChk('/login'), function (req, res){

  });

};