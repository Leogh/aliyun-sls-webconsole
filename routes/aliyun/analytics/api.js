/**
 * Created by Roman Lo on 5/18/2016.
 */
var async = require('async');
var express = require('express');
var passport = require('passport');
var crypto = require("crypto");
var merge = require("merge");
var log4js = require('log4js');
var ALY = require("aliyun-sdk");
var config = require("../../../common/config");
var restResp = require("../../../common/rest-response");
var utils = require('../../../common/utils');
var AnalyticsField = require("../../../models/analytics-field");
var AnalyticsCompareSet = require("../../../models/analytics-compare-set");
var AnalyticsFieldFilter = require("../../../models/analytics-field-filter");

var logger = log4js.getLogger("aliyun.sls");
var shasum = crypto.createHash('sha1');
shasum.update(config.aliyun.logAnalytics.accessKeyId);
const ALY_LOG_ANALYTICS_ACCESS_HASH = shasum.digest('hex');

var sls = new ALY.SLS(config.aliyun.logAnalytics);

var router = express.Router();

// analyticsField

router.get('/analyticsField', utils.authChk('/ '), function (req, res, next) {
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
    .exec(function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(result));
    });
});

router.post('/analyticsField', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var field = data.field;
  addOrUpdateAnalyticsField(res, field);
});

router.put('/analyticsField', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var field = data.field;
  addOrUpdateAnalyticsField(res, field);
});

router.delete('/analyticsField', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  var fieldId = data._id;
  AnalyticsField.remove({
    _id: fieldId
  }, function (err, result) {
    if (err) {
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
    if (err) {
      utils.handleMongooseError(res, err);
    }
    res.send(restResp.success(true));
  });
});

// field filters

router.get('/filter', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  var queryOptions = {};
  if (data.name) {
    queryOptions.name = data.name;
  }
  AnalyticsFieldFilter
    .find(queryOptions)
    .exec(function (err, filters) {
      if (err) {
        utils.handleMongooseError(res, err);
      }
      res.send(restResp.success(filters));
    });
});

router.post('/filter', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var filter = data.filter;
  if (filter._id != null) {
    return res.send(restResp.error(restResp.CODE_ERROR, 'A new record should not have a pre-set id'));
  }
  addOrUpdateAnalyticsFieldFilter(res, filter);
});

router.put('/filter', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var filter = data.filter;
  addOrUpdateAnalyticsFieldFilter(res, filter);
});

router.delete('/filter', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  var filterId = data._id;
  AnalyticsFieldFilter.remove({
    _id: filterId
  }, function (err, result) {
    if (err) {
      utils.handleMongooseError(res, err);
    }
    res.send(restResp.success(true));
  });
});

// analysis request

router.get('/dashboard', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  if (data.compareSetId == null) {
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
          select: 'name filterName'
        })
        .exec(callback);
    },
    // execute log analysis
    function (compareSet, callback) {
      if (compareSet == null) {
        // no compare set is found
        callback(null, null);
        return;
      }
      cpSet = compareSet;
      var from = utils.calculateUNIXTimestamp(new Date(data.from));
      var to = utils.calculateUNIXTimestamp(new Date(data.to));
      dateRange.from = from;
      dateRange.to = to;
      dashboardTask(compareSet, dateRange, callback);
    }
  ], function (err, results) {
    if (err) {
      utils.handleMongooseError(res, err);
      return;
    }
    if (results == null) {
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

router.get('/report', utils.authChk('/login'), function (req, res, next) {

});

module.exports = router;


function addOrUpdateAnalyticsField(res, field) {
  AnalyticsField.findOne({
    _id: field._id,
    hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
  }).exec(function (err, obj) {
    if (err) {
      utils.handleMongooseError(res, err);
      return;
    }
    if (obj) {
      // update
      if (typeof field.filterName === 'undefined' || /^\s*$/.test(field.filterName)) {
        field.filterName = null;
      }
      obj.name = field.name;
      obj.valueSet = field.valueSet;
      obj.status = field.status;
      obj.filterName = field.filterName;
      obj.save(function (err, data) {
        if (err) {
          utils.handleMongooseError(res, err);
          return;
        }
        res.send(restResp.success(data));
      });
    } else if (!field._id) {
      // add
      var newItem = new AnalyticsField({
        name: field.name,
        filterName: field.filterName,
        hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
        valueSet: field.valueSet,
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
        if (compareSet.compareConditions == null || typeof compareSet.compareConditions === 'undefined') {
          compareSet.compareConditions = [];
        }
        var fieldIds = [];
        compareSet.compareConditions.forEach(function (item) {
          fieldIds.push(item.field);
        });
        if (fieldIds.length == 0) {
          cb(null, true);
        } else {
          AnalyticsField
            .find({hashing: ALY_LOG_ANALYTICS_ACCESS_HASH, status: 1})
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
        }
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
      if (!result.groupField) {
        res.send(restResp.error('Invalid groupField'));
        return;
      }
      if (!result.conditionField) {
        res.send(restResp.error('Invalid conditionField'));
        return;
      }

      if (existedSet) {
        // update
        existedSet.name = compareSet.name || existedSet.name;
        existedSet.compareField = result.compareField === true ? existedSet.compareField._id : result.compareField._id;
        existedSet.compareConditions = result.conditionField === true ? [] : result.conditionField;
        if (result.groupField === true) {
          existedSet.groupField = existedSet.groupField ? existedSet.groupField._id : null;
        } else {
          existedSet.groupField = result.groupField._id;
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
          compareConditions: result.conditionField instanceof Array ? result.conditionField : null,
          groupField: result.groupField === true ? null : result.groupField._id,
          chartType: compareSet.chartType,
          strategy: parseInt(compareSet.strategy),
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
  if (!isForAdd) {
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

function addOrUpdateAnalyticsFieldFilter(res, filter) {
  AnalyticsFieldFilter.findOne({
    _id: filter._id
  }).exec(function (err, obj) {
    if (err) {
      return utils.handleMongooseError(res, err);
    }
    if (obj) {
      // update
      obj.name = filter.name;
      obj.interpretations = filter.interpretations;
      obj.status = filter.status;
      obj.save(function (err, data) {
        if (err) {
          utils.handleMongooseError(res, err);
          return;
        }
        res.send(restResp.success(data));
      });
    } else if (!filter._id) {
      // add
      var newItem = new AnalyticsFieldFilter({
        name: filter.name,
        interpretations: filter.interpretations,
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

function histogramTask(project, store, topic, dateRange, query, callback) {
  sls.getHistograms({
    //必选字段
    projectName: project,
    logStoreName: store,
    from: dateRange.from,
    to: dateRange.to,
    topic: topic,
    query: query,
  }, function (err, data) {
    if (err) {
      logger.warn('error occurs when calling Aliyun SLS API.', err.code, err.errorMessage || err.message);
      return callback(err, false);
    }
    // retrieve log count
    var count = data.headers['x-log-count'];
    if (count == 0) {
      // console.log(count, fullRecordQuery);
    }
    callback(null, count);
  });
}

function dashboardTask(compareSet, dateRange, taskCallback) {
  var project = 'didamonitor';
  var store = 'monitor';
  var topic = 'Monitoring';
  var conditionQuery = buildConditionQuery(compareSet);
  async.parallel({
    full: function (cbHisParallel) {
      // check if group query enabled.
      if (compareSet.groupField != null) {
        var fullDict = {};
        async.every(compareSet.groupField.valueSet, function (groupFieldValue, groupFieldCb) {
          // build group field query
          var groupFieldQuery = buildLogSearchQuery(compareSet.groupField.name, groupFieldValue);
          // build full record query
          var fullRecordQuery = (conditionQuery && conditionQuery.length > 0) ? `${conditionQuery} and ( ${groupFieldQuery} )` : groupFieldQuery;
          // execute full record task
          histogramTask(project, store, topic, dateRange, fullRecordQuery, function (err, count) {
            if (err) {
              return groupFieldCb(err, false);
            }
            fullDict[groupFieldValue] = count;
            groupFieldCb(null, true);
          });
        }, function (err, result) {
          cbHisParallel(err, fullDict);
        });
      } else {
        histogramTask(project, store, topic, dateRange, conditionQuery, cbHisParallel);
      }
    },
    sub: function (cbHisParallel) {
      var batchCompareField = function (preQuery, batchCmdCallback) {
        var dict = {};
        async.every(compareSet.compareField.valueSet, function (fieldValue, cbFieldValue) {
          var fQ = buildLogSearchQuery(compareSet.compareField.name, fieldValue);
          var subQ = preQuery ? `${preQuery} and ( ${fQ} )` : fQ;
          // console.log(fieldValue, subQ, ' ~~ ', preQuery);
          histogramTask(project, store, topic, dateRange, subQ, function (err, count) {
            if (err) {
              logger.warn('error occurs when calling Aliyun SLS API.', err.code, err.errorMessage || err.message);
              return cbFieldValue(err, false);
            }
            dict[fieldValue] = count;
            cbFieldValue(null, count);
          });
        }, function (err, result) {
          batchCmdCallback(err, dict);
        });
      };
      if (compareSet.groupField != null) {
        var subDict = {};
        async.every(compareSet.groupField.valueSet, function (groupFieldValue, groupFieldValueCb) {
          // build field query for each of the group field values
          var groupFieldValueQuery = buildLogSearchQuery(compareSet.groupField.name, groupFieldValue);
          var preQuery = (conditionQuery && conditionQuery.length > 0) ? `${conditionQuery} and ( ${groupFieldValueQuery} )` : groupFieldValueQuery;
          // execute compare field tasks
          batchCompareField(preQuery, function (err, result) {
            subDict[groupFieldValue] = result;
            groupFieldValueCb(err, result);
          });
        }, function (err, result) {
          cbHisParallel(err, subDict);
        });
      } else {
        // execute compare field tasks
        batchCompareField(conditionQuery, function (err, result) {
          cbHisParallel(err, result);
        });
      }
    }
  }, function (err, result) {
    if (err) {
      return taskCallback(err, false);
    }
    taskCallback(null, {
      full: result.full,
      sub: result.sub,
    });
  });
}

function buildConditionQuery(compareSet) {
  var q = '';
  if (compareSet.compareConditions && compareSet.compareConditions.length > 0) {
    compareSet.compareConditions.forEach(function (cond, index) {
      var sub = `( ${buildLogSearchQuery(cond.field.name, cond.value)} )`;
      q += ( index > 0 ? ` and ${sub}` : sub );
    });
  }
  return q;
}

function buildLogSearchQuery(fieldName, fieldValue) {
  return `"${fieldName}":"${fieldValue.replace(/"/g, '\\"').replace(/:/g, '\\:')}"`;
}