/* namespace: aliyun-sls */
var express = require('express');
var passport = require('passport');
var crypto = require("crypto");
var shasum = crypto.createHash('sha1');
var merge = require("merge");
var config = require("../../common/config");
var utils = require('../../common/utils');
var slsUtils = require('../../common/aliyun-sls-utils');
var AliyunSLSProject = require("../../models/aliyun-sls-project");
var User = require("../../models/user");
var ALY = require("aliyun-sdk");
var log4js = require('log4js');
var logger = log4js.getLogger("aliyun.sls");
var restResp = require("../../common/rest-response");

var router = express.Router();
/* create sls instance */
var sls = new ALY.SLS(config.aliyun.sls);

shasum.update(config.aliyun.sls.accessKeyId);
const ALY_SLS_ACCESS_HASH = shasum.digest('hex');

/* GET sls console home page. */
router.get('/', utils.authChk('/login'), function(req, res, next) {
  var userId = req.user ? req.user._doc._id : null;
  User
    .findOne({ _id : userId })
    .exec(function (err, user) {
      var favoredProj = null;
      if (!err && user) {
        var doc = user._doc;
        if (doc.favorProjects && doc.favorProjects[ALY_SLS_ACCESS_HASH]) {
          favoredProj = doc.favorProjects[ALY_SLS_ACCESS_HASH];
        }
      }
      res.render('consoles/aliyun-sls', {
        title: 'Aliyun SLS Web Console',
        favoredProject: favoredProj,
        isProjectFavored: favoredProj != null
      });
    });
    
});

/* GET get the project */
router.get('/project', utils.authChk('/login'), function (req, res, next) {
  AliyunSLSProject
    .find({ hashing: ALY_SLS_ACCESS_HASH })
    .sort({ name: -1 })
    .exec(function (err, projects) {
      if(err){
        console.error(err);
      }
      res.send(projects);
    });
});

/* POST save the project */
router.post('/project', utils.authChk('/login'), function (req, res, next) {
  var projectName = req.param('projectName');
  var project = new AliyunSLSProject({
    name: projectName,
    status: 1,
    hashing: ALY_SLS_ACCESS_HASH,
  });
  project.save(function (err) {
    if (err) {
      console.info('failed to create a new project: ', project);
      res.send(err);
      return;
    }
    console.info('a new project created: ', project);
    res.send(project);
  });
});

router.get('/favor-project', utils.authChk('/login'), function (req, res, next) {
  User
    .findOne({ _id : req.user._doc._id })
    .exec(function (err, user) {
      if (err) {
        res.send(restResp.error(0, 'user not found'));
        return;
      }
      var doc = user._doc;
      if (doc.favorProjects && doc.favorProjects[ALY_SLS_ACCESS_HASH]) {
        res.send(restResp.success(doc.favorProjects[ALY_SLS_ACCESS_HASH]));
        return;
      }
      res.send(restResp.success(null));
    });
});

router.put('/favor-project', utils.authChk('/login'), function (req, res, next) {
  var projectName = req.query.projectName;
  var isFavor = req.query.isFavor == 'true';
  var result = null;
  User
    .findOne({ _id : req.user._doc._id })
    .exec(function (err, user) {
      if (err) {
        res.send(restResp.error(0, 'user not found'));
        return;
      }
      var doc = user._doc;
      if (!doc.favorProjects) {
        doc.favorProjects = {};
      }
      if (isFavor) {
        doc.favorProjects[ALY_SLS_ACCESS_HASH] = projectName;
      } else {
        delete doc.favorProjects[ALY_SLS_ACCESS_HASH];
      }
      user.markModified('favorProjects');
      user.save(function (err) {
        if (err) {
          console.info('failed to favor/unfavor a project: ', projectName, isFavor);
          res.send(restResp.error(0, 'failed to favor/unfavor a project'));
          return;
        }
        console.info('a project favored/unfavored: ', projectName, isFavor);
        res.send(restResp.success(isFavor ? projectName : null));
      });
    });
});

/* GET get log stores inside a project */
router.get('/logstores', utils.authChk('/login'), function (req, res, next) {
  sls.listLogStores(req.query, function (err, data) {
    if (!err) {
      AliyunSLSProject
        .findOne({ hashing: ALY_SLS_ACCESS_HASH, name: req.query.projectName })
        .exec(function (err, proj) {
          if (proj == null) {
            var project = new AliyunSLSProject({
              name: req.query.projectName,
              status: 1,
              hashing: ALY_SLS_ACCESS_HASH,
            });
            project.save(function (err) {
              if (err) {
                console.info('failed to create a new project: ', project);
                return;
              }
              console.info('a new project created: ', project);
            });
            return;
          }
          console.info('project existed: ', req.query.projectName);
        });
    }
    slsUtils.aliyunSLSCallback.call(res, err, data);
  });
});

/* GET get topics of a log store */
router.get('/topics', utils.authChk('/login'), function (req, res, next) {
  sls.listTopics({
    //必选字段
    projectName: req.query.projectName,
    logStoreName: req.query.logStoreName,
    //token: '', //可选参数，从某个 topic 开始列出,按照字典序,默认为空 6
    line: 100,   //可选参数，读取的行数,默认值为 100;范围 0-100
  }, slsUtils.aliyunSLSCallback.bind(res));
});

/* GET get histograms of a topic */
router.get('/histograms', utils.authChk('/login'), function (req, res, next) {
  var from = utils.calculateUNIXTimestamp(new Date(req.query.from));
  var to = utils.calculateUNIXTimestamp(new Date(req.query.to));
  var topic = req.query.topic;
  var query = req.query.query;
  sls.getHistograms({
    //必选字段
    projectName: req.query.projectName,
    logStoreName: req.query.logStoreName,
    from: from, //开始时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)
    to: to,    //结束时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)

    //以下为可选字段
    topic: topic,      //指定日志主题(用户所有主题可以通过listTopics获得)
    query: query    //查询的关键词,不输入关键词,则查询全部日志数据
  }, slsUtils.aliyunSLSCallback.bind(res));
});

router.get('/logs', utils.authChk('/login'), function (req, res, next) {
  var from = utils.calculateUNIXTimestamp(new Date(req.query.from));
  var to = utils.calculateUNIXTimestamp(new Date(req.query.to));
  var topic = req.query.topic;
  var query = req.query.query;
  var pageNum = req.query.pageNum - 1;
  var pageSize = req.query.pageSize;
  sls.getLogs({
    //必选字段
    projectName: req.query.projectName,
    logStoreName: req.query.logStoreName,
    from: from, //开始时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)
    to: to,     //结束时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)

    //以下为可选字段
    topic: topic,   //指定日志主题(用户所有主题可以通过listTopics获得)
    reverse: true,  //是否反向读取,只能为 true 或者 false,不区分大小写(默认 false,为正向读取,即从 from 开始到 to 之间读取 Line 条)
    query: query,   //查询的关键词,不输入关键词,则查询全部日志数据
    line: pageSize, //读取的行数,默认值为 100,取值范围为 0-100
    offset: pageNum * pageSize //读取起始位置,默认值为 0,取值范围>0
  }, slsUtils.aliyunSLSCallback.bind(res));
});

module.exports = router;
