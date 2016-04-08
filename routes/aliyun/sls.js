var express = require('express');
var config = require("../../common/config");
var AliyunSLSProject = require("../../models/aliyun-sls-project");
var ALY = require("aliyun-sdk");

var router = express.Router();
/* create sls instance */
var sls = new ALY.SLS(config.aliyun.sls);

/* GET sls console home page. */
router.get('/', function(req, res, next) {
    /*AliyunSLSProject
      .find()
      .sort({ name: -1 })
      .exec(function (err, projects) {
        if(err){
          console.error(err);
        }
        res.render('consoles/aliyun-sls', {
          title: 'Aliyun SLS Web Console',
          projects: projects
        });
      });*/
    res.render('consoles/aliyun-sls', {
      title: 'Aliyun SLS Web Console',
      projects: null
    });
});

router.get('/project', function (req, res, next) {
  var projectName = req.param('name');
  sls.listLogStores({
    projectName: projectName,
  }, function (err, data) {
    if (err) {
      res.send(err);
      return;
    }
    res.send(data);
  });
});

module.exports = router;