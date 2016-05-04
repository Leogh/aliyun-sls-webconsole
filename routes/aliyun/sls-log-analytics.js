/* namespace: sls-log-analytics */
var async = require('async');
var express = require('express');
var passport = require('passport');
var crypto = require("crypto");
var shasum = crypto.createHash('sha1');
var merge = require("merge");
var config = require("../../common/config");
var restResp = require("../../common/rest-response");
var utils = require('../../common/utils');
var log4js = require('log4js');
var ALY = require("aliyun-sdk");
var logger = log4js.getLogger("aliyun.sls");
var AppEnum = require('../../common/app-enum-types');

var AnalyticsField = require("../../models/analytics-field");
var AnalyticsCompareSet = require("../../models/analytics-compare-set");

var router = express.Router();

var sls = new ALY.SLS(config.aliyun.logAnalytics);

shasum.update(config.aliyun.logAnalytics.accessKeyId);
const ALY_LOG_ANALYTICS_ACCESS_HASH = shasum.digest('hex');

/* GET sls console home page. */
router.get('/', utils.authChk('/login'), function(req, res, next) {
  res.render('consoles/log-analytics', {
    title: 'Analytics'
  });
});

// analyticsField

router.get('/analyticsField', utils.authChk('/login'), function(req, res, next) {
  var data = req.query;
  var queryOption = {
    hashing: ALY_LOG_ANALYTICS_ACCESS_HASH
  };
  if (typeof data.fieldName !== 'undefined') {
    queryOption.name = {
      $regex: data.fieldName,
    };
  }
  if (typeof data.status !== 'undefined') {
    queryOption.status = data.status;
  }
  AnalyticsField
    .find(queryOption)
    .exec(function (err, result){
      if (err) {
        utils.handleMongooseError(res, err);
        return;  
      }
      res.send(restResp.success(result));
    });
});

router.post('/analyticsField', utils.authChk('/login'), function (req, res, next) {
  addOrUpdateAnalyticsField(res, null, req.body.fieldName, req.body.valueSet, 1);
});

router.put('/analyticsField', utils.authChk('/login'), function (req, res, next) {
  addOrUpdateAnalyticsField(res, req.body._id, req.body.fieldName, req.body.valueSet, req.body.status);
});

router.delete('/analyticsField', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  var fieldId = data._id;
  AnalyticsField.remove({
    _id: fieldId
  }, function (err, result) {
    if(err){
      utils.handleMongooseError(res, err);
    }
    res.send(restResp.success(true));
  });
});

// analyticsCompareSet

router.get('/analyticsCompareSet', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  var queryOption = {
    hashing: ALY_LOG_ANALYTICS_ACCESS_HASH
  };
  if (typeof data.compareSetName !== 'undefined') {
    queryOption.name = {
      $regex: data.compareSetName,
    };
  }
  if (typeof data.status !== 'undefined') {
    queryOption.status = data.status;
  }
  AnalyticsCompareSet
    .find(queryOption)
    .populate('compareField')
    .populate('groupField')
    .populate('compareConditions.field')
    .exec(function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(result));
    });
});

router.post('/analyticsCompareSet', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var compareSet = data.compareSet;
  if (compareSet._id) {
    res.send(restResp.error(restResp.CODE_ERROR, 'compare set should be new.'));
    return;
  }
  addOrUpdateAnalyticsCompareSet(res, compareSet);
});

router.put('/analyticsCompareSet', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var compareSet = data.compareSet;
  if (!compareSet._id) {
    res.send(restResp.error(restResp.CODE_ERROR, 'compare set should be existed.'));
    return;
  }
  addOrUpdateAnalyticsCompareSet(res, compareSet);
});

router.delete('/analyticsCompareSet', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  var compareSetId = data._id;
  AnalyticsCompareSet.remove({
    _id: compareSetId
  }, function (err, result) {
    if(err){
      utils.handleMongooseError(res, err);
    }
    res.send(restResp.success(true));
  });
});

// analysis request

router.get('/dashboard', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  if (data.compareSetId == null){
    res.send(restResp.error(restResp.CODE_ERROR, 'unknown compare set'));
    return;
  }
  var cpSet = null;
  var dateRange = {from: null, to: null};
  async.waterfall([
    // query the target AnalyticsCompareSet
    function (callback) {
      AnalyticsCompareSet.findOne({
        _id: data.compareSetId,
        hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
      })
      .populate('compareField')
      .populate('groupField')
      .populate({
        path: 'compareConditions.field',
        select: 'name'
      })
      .exec(callback);
    },
    function (compareSet, callback) {
      if (compareSet == null) {
        callback(null, null);
        return;
      }
      cpSet = compareSet;
      var from = utils.calculateUNIXTimestamp(new Date(data.from));
      var to = utils.calculateUNIXTimestamp(new Date(data.to));
      dateRange.from = from;
      dateRange.to = to;
      var q = null;
      if (compareSet.strategy == AppEnum.CompareStrategy.Condition){
        q = buildConditionQuery(compareSet);
      }
      async.parallel({
        full: function (cbHisParallel) {
          var fullRecordTask = function (fRecQ, callBack) {
            sls.getHistograms({
              //必选字段
              projectName: 'didamonitor',//data.projectName,
              logStoreName:  'monitor', //data.logStoreName,
              from: from, //开始时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)
              to: to,    //结束时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)

              //以下为可选字段
              topic: 'Monitoring', //topic,      //指定日志主题(用户所有主题可以通过listTopics获得)
              query: fRecQ,
            }, function (err, data) {
              if (err) {
                logger.warn('error occurs when calling Aliyun SLS API.', err.code, err.errorMessage || err.message);
                return callBack(err, false);
              }
              var count = data.headers['x-log-count'];
              callBack(null, count);
            });
          };
          if (compareSet.strategy == AppEnum.CompareStrategy.Group && compareSet.groupField != null) {
            var fullDict = {};
            async.every(compareSet.groupField.valueSet, function (gFieldValue, gFieldCb) {
              var gFQ = buildLogSearchQuery(compareSet.groupField.name, gFieldValue);
              var fRecQ = q ? `${q} and ( ${gFQ} )` : gFQ;
              fullRecordTask(fRecQ, function (err, result) {
                if (err) {
                  return gFieldCb(err, false);
                }
                fullDict[gFieldValue] = result;
                gFieldCb(null, true);
              });
            }, function (err, result) {
              cbHisParallel(err, fullDict);
            });
          } else {
            fullRecordTask(q, cbHisParallel);
          }
        },
        sub: function (cbHisParallel) {
          var batchCompareField = function (preQuery, batchCmdCallback) {
            var dict = {};
            async.every(compareSet.compareField.valueSet, function (fieldValue, cbFieldValue) {
              var fQ = buildLogSearchQuery(compareSet.compareField.name, fieldValue);
              // var subQ = q ? `${q} and ( ${fQ} )` : fQ; // build sub query
              var subQ = preQuery ? `${preQuery} and ( ${fQ} )` : fQ;
              sls.getHistograms({
                //必选字段
                projectName: 'didamonitor',//data.projectName,
                logStoreName:  'monitor', //data.logStoreName,
                from: from, //开始时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)
                to: to,    //结束时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)

                //以下为可选字段
                topic: 'Monitoring', //topic,      //指定日志主题(用户所有主题可以通过listTopics获得)
                query: subQ    //查询的关键词,不输入关键词,则查询全部日志数据
              }, function (err, data) {
                if (err) {
                  logger.warn('error occurs when calling Aliyun SLS API.', err.code, err.errorMessage || err.message);
                  return cbFieldValue(err, false);
                }
                var count = data.headers['x-log-count'];
                dict[fieldValue] = count;
                cbFieldValue(null, count);
              });
            }, function (err, result) {
              batchCmdCallback(err, dict);
            });
          };
          if (compareSet.strategy == AppEnum.CompareStrategy.Group && compareSet.groupField != null) {
            var subDict = {};
            async.every(compareSet.groupField.valueSet, function (gFieldValue, cbGFieldValue) {
              var fQ = buildLogSearchQuery(compareSet.groupField.name, gFieldValue);
              batchCompareField(fQ, function (err, result) {
                subDict[gFieldValue] = result;
                cbGFieldValue(err, result);
              });
            }, function (err, result) {
              cbHisParallel(err, subDict);
            });
          } else {
            batchCompareField(q, function (err, result) {
              cbHisParallel(err, result);
            });
          }
        }
      }, function (err, result) {
        if (err) {
          return callback(err, false);
        }
        callback(null, {
          full: result.full,
          sub: result.sub,
        })
      });
    }
  ], function (err, results){
    if (err) {
      utils.handleMongooseError(res, err);
      return;
    }
    if (results == null){
      res.send(restResp.error(restResp.CODE_ERROR, 'Unknown compare set.'));
      return;
    }
    res.send(restResp.success({
      compareSet: cpSet,
      dateRange: dateRange,
      dashboard: results,
    }));
  });
});

module.exports = router;


function addOrUpdateAnalyticsField(res, _id, fieldName, valueSet, status) {
  AnalyticsField.findOne({
    _id: _id,
    hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
  }).exec(function (err, obj) {
    if (err) {
      utils.handleMongooseError(res, err);
      return;
    }
    if (obj) {
      // update
      obj.name = fieldName || obj.name;
      obj.valueSet = valueSet || obj.valueSet;
      obj.status = typeof status === 'undefined' ? obj.status : status;
      obj.save(function (err, data) {
        if (err) {
          utils.handleMongooseError(res, err);
          return;
        }
        res.send(restResp.success(data));
      });
    } else if (!_id){
      // add
      var newItem = new AnalyticsField({
        name: fieldName,        
        hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
        valueSet: valueSet,
        status: 1,
      });
      newItem.save(function (err, data) {
        if (err) {
          utils.handleMongooseError(res, err);
          return;
        }
        res.send(restResp.success(data));
      });
    } else {
      res.send(restResp.error(restResp.CODE_ERROR, 'invalid item'));
    }
  });
}

function addOrUpdateAnalyticsCompareSet(res, compareSet) {
  var isForAdd = compareSet._id == null;
  var asyncTsk = function (existedSet) {
    async.parallel({
      compareField: function (cb) {
        AnalyticsField
          .findOne({
            hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
            _id: compareSet.compareField,
          })
          .exec(cb);
      },
      groupField: function (cb) {
        if (compareSet.strategy != AppEnum.CompareStrategy.Group){
          return cb(null, false);
        }
        if (compareSet.groupField == null || typeof compareSet.groupField === 'undefined') {
          compareSet.groupField = '';
        }
        if (/\w+/.test(compareSet.groupField)) {
          AnalyticsField
            .findOne({
              hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
              _id: compareSet.groupField
            })
            .exec(cb);
        } else {
          cb(null, true);
        }
      },
      conditionField: function (cb) {
        if (compareSet.strategy != AppEnum.CompareStrategy.Condition) {
          return cb(null, false);
        }
        var fieldIds = [];
        compareSet.compareConditions.forEach(function (item) {
          fieldIds.push(item.field);
        });
        AnalyticsField
          .find({ hashing: ALY_LOG_ANALYTICS_ACCESS_HASH, status: 1 })
          .where('_id').in(fieldIds)
          .exec(function (err, result) {
            if (err) {
              cb(err, null);
              return;
            }
            if (result.length != compareSet.compareConditions.length) {
              cb('some conditions not found', null);
              return;
            }
            cb(null, compareSet.compareConditions);
          });
      },
    }, function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      if (!result.compareField) {
        res.send(restResp.error('Invalid compareField'));
        return;
      }
      if (compareSet.strategy == AppEnum.CompareStrategy.Group && !result.groupField) {
        res.send(restResp.error('Invalid groupField'));
        return;
      }
      if (compareSet.strategy == AppEnum.CompareStrategy.Condition && !result.conditionField) {
        res.send(restResp.error('Invalid conditionField'));
        return;
      }
      
      if (existedSet) {
        // update 
        existedSet.name = compareSet.name || existedSet.name;
        existedSet.compareField = result.compareField === true ? existedSet.compareField._id : result.compareField._id;
        // handle compare conditions and group field
        if (compareSet.strategy == AppEnum.CompareStrategy.Condition) {
          existedSet.compareConditions = result.conditionField;
          existedSet.groupField = null;
        } else if (compareSet.strategy == AppEnum.CompareStrategy.Group){
          if (result.groupField === true) {
            existedSet.groupField =  existedSet.groupField ?  existedSet.groupField._id : null;
          } else {
            existedSet.groupField = result.groupField._id;
          }
          existedSet.compareConditions = [];
        }

        existedSet.chartType = compareSet.chartType || existedSet.chartType;
        existedSet.strategy = parseInt(compareSet.strategy);
        existedSet.status = compareSet.status;
        existedSet.save(function (err, result) {
          if (err) {
            utils.handleMongooseError(res, err);
            return;
          }
          res.send(restResp.success(result));
        });
      } else {
        // add
        var newSet = new AnalyticsCompareSet({
          name: compareSet.name,
          hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
          compareField: result.compareField._id,
          groupField: result.groupField === true ? null : result.groupField._id,
          chartType: compareSet.chartType,
          status: 1,
        });
        newSet.save(function (err, result) {
          if (err) {
            utils.handleMongooseError(res, err);
            return;
          }
          res.send(restResp.success(result));
        });
      }      
    });
  };
  if(!isForAdd){
    if (!/\w+/.test(compareSet.compareField) || compareSet.compareField == null || typeof compareSet.compareField === 'undefined') {
      res.send(restResp.error(restResp.CODE_ERROR, 'compareFieldId cannot be empty'));
      return;
    }
    AnalyticsCompareSet.findOne({
      _id: compareSet._id,
      hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
    }).exec(function (err, target) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      if (target == null) {
        res.send(restResp.error(restResp.CODE_ERROR, 'invalid compare set'));
        return;
      }
      asyncTsk(target);
    });
  } else {
    asyncTsk(null);
  }
}

function buildConditionQuery(compareSet) {
  var q = '';
  compareSet.compareConditions.forEach(function (cond, index) {
    var sub = `( ${buildLogSearchQuery(cond.field.name, cond.value)} )`;
    q += ( index > 0 ? ` and ${sub}` : sub );
  });
}

function buildLogSearchQuery(fieldName, fieldValue) {
  return `"${fieldName}":"${fieldValue.replace(/"/g, '\\"').replace(/:/g, '\\:')}"`;
}

