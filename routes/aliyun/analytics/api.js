/**
 * Created by Roman Lo on 5/18/2016.
 */
"use strict";
var async = require('async');
var express = require('express');
var passport = require('passport');
var crypto = require("crypto");
var merge = require("merge");
var log4js = require('log4js');
var ALY = require("aliyun-sdk");
var config = require('json-config-ext').config;
var restResp = require("../../../common/rest-response");
var utils = require('../../../common/utils');
var AnalyticsField = require("../../../models/analytics-field");
var AnalyticsCompareSet = require("../../../models/analytics-compare-set");
var AnalyticsFieldFilter = require("../../../models/analytics-field-filter");
var AnalyticsReport = require("../../../models/analytics-report");
var AnalyticsReportPeriodModel = require("../../../models/analytics/analytics-report-period-model");
var AppEnum = require("../../../common/app-enum-types");


var logger = log4js.getLogger("aliyun-sls-webconsole");
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
  }, function (err) {
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

// analytics report models

router.get('/report', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  var queryOptions = {};
  if (data.name) {
    queryOptions.name = data.name;
  }
  AnalyticsReport
    .find(queryOptions)
    .populate('compareSets')
    .exec(function (err, reports) {
      if (err) {
        utils.handleMongooseError(res, err);
      }
      res.send(restResp.success(reports));
    });
});

router.post('/report', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var report = data.report;
  addOrUpdateAnalyticsReport(res, report);
});

router.put('/report', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var report = data.report;
  addOrUpdateAnalyticsReport(res, report);
});

router.delete('/report', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  var reportId = data._id;
  AnalyticsReport.remove({
    _id: reportId
  }, function (err) {
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

router.get('/reporting-task', utils.authChk('/login'), function (req, res, next) {
  var data = req.query;
  if (data.reportId == null) {
    res.send(restResp.error(restResp.CODE_ERROR, 'unknown report'));
    return;
  }
  var reportObj = null;
  var period = data.period;
  var periodUnit = data.periodUnit;
  var dateRange = {from: null, to: null};
  async.waterfall([
    // load AnalyticsReport
    function (cb) {
      AnalyticsReport
        .findOne({
          _id: data.reportId,
          hashing: ALY_LOG_ANALYTICS_ACCESS_HASH
        })
        .populate({
          path: 'compareSets',
          populate: [
            'compareField',
            'groupField',
            {
              path: 'compareConditions.field',
              select: 'name filterName'
            }
          ]
        })
        .exec(function (err, report) {
          if (err) {
            cb(err, null);
          }
          if (!report) {
            cb('no report found', null);
          }
          cb(null, report);
        });
    },
    // construct report
    function (report, cb) {
      reportObj = report;
      var from = utils.calculateUNIXTimestamp(new Date(data.from));
      var to = utils.calculateUNIXTimestamp(new Date(data.to));
      dateRange.from = from;
      dateRange.to = to;
      var intervalArr = calculatePeriodArray(dateRange, period, periodUnit);
      var lineTaskSet = buildReportTasks(intervalArr, report.compareSets);
      cb(null, lineTaskSet);
    }
  ], function (err, tasks) {
    if (err) {
      if (err.message) {
        utils.handleMongooseError(res, err);
      } else {
        res.send(restResp.error(restResp.CODE_ERROR, err));
      }
      return;
    }
    res.send(restResp.success({
      options: {
        report: reportObj,
        dateRange: dateRange,
        period: period,
        periodUnit: periodUnit
      },
      tasks: tasks,
    }));
  });
});

router.post('/reporting', utils.authChk('/login'), function (req, res, next) {
  var data = req.body;
  var tasks = data.tasks;
  execReportTasks(tasks, function (err, results) {
    if (err) {
      return res.send(restResp.error(restResp.CODE_ERROR, err));
    }
    var extDict = buildReportExtDict(results);
    res.send(restResp.success({
      report: extDict
    }));
  });
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
      obj.colorSetting = field.colorSetting;
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
        colorSetting: field.colorSetting,
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

function addOrUpdateAnalyticsReport(res, report) {
  var isForAdd = report._id == null;
  var updateTsk = function (existedReport) {
    async.waterfall([
      function (cb) {
        var compareSetIds = [];
        report.compareSets.forEach(function (item) {
          compareSetIds.push(item._id);
        });
        AnalyticsCompareSet
          .find({hashing: ALY_LOG_ANALYTICS_ACCESS_HASH, status: 1})
          .where('_id').in(compareSetIds)
          .exec(function (err, result) {
            if (err) {
              cb(err, null);
              return;
            }
            if (result.length != report.compareSets.length) {
              cb('some compare sets not found', null);
              return;
            }
            cb(null, report.compareSets);
          });
      }
    ], function (err, compareSets) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      if (compareSets.length == 0) {
        res.send(restResp.error(restResp.CODE_ERROR, 'Compare set is empty'));
        return;
      }
      if (existedReport) {
        // update
        existedReport.name = report.name;
        existedReport.compareSets = compareSets;
        existedReport.period = report.period;
        existedReport.periodUnit = report.periodUnit;
        existedReport.status = report.status;
        existedReport.save(function (err, data) {
          if (err) {
            utils.handleMongooseError(res, err);
            return;
          }
          res.send(restResp.success(data));
        });
      } else {
        // add
        var newItem = new AnalyticsReport({
          name: report.name,
          hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
          compareSets: report.compareSets,
          period: report.period,
          periodUnit: report.periodUnit,
          status: 1,
        });
        newItem.save(function (err, data) {
          if (err) {
            utils.handleMongooseError(res, err);
            return;
          }
          res.send(restResp.success(data));
        });
      }
    });
  };
  if (!isForAdd) {
    AnalyticsReport.findOne({
      _id: report._id,
      hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
    }).exec(function (err, target) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      if (target == null) {
        res.send(restResp.error(restResp.CODE_ERROR, 'invalid analytics report'));
        return;
      }
      updateTsk(target);
    });
  } else {
    updateTsk(null);
  }
}

function histogramTask(project, store, topic, dateRange, query, callback) {
  // console.log(`searching - ${query}`);
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

function buildReportTasks(intervals, compareSets){
  var total = 0;
  var lineSetTasks = {};
  compareSets.forEach(function (compareSet) {
    var intervalTasks = [];
    intervals.forEach(function (interval) {
      var dashboardDateRange = {
        from: interval.from,
        to: interval.to
      };
      total++;
      intervalTasks.push({
        set: compareSet,
        range: dashboardDateRange,
        interval: interval,
        callback: null,
      });
    });
    lineSetTasks[compareSet.name] = intervalTasks;
  });
  console.log(`tasks ready! Total ${total} tasks, will take more than ${total * 0.5} seconds`);
  return lineSetTasks;
}

function execReportTasks(tasks, taskCallback) {
  var executed = 0;
  var total = tasks.length;
  var timeouts = [];
  var stopExecute = function () {
    timeouts.forEach(function (t) {
      clearTimeout(t);
    });
  };
  tasks.forEach(function (task, index) {
    var timeout = setTimeout(function (t) {
      var compareSet = t.set;
      var dashboardDateRange = t.range;
      var interval = t.interval;
      dashboardTask(compareSet, dashboardDateRange, function (err, results) {
        executed++;
        if (err) {
          stopExecute();
          taskCallback(err, null);
          return;
        }
        interval.dashboards[compareSet.name] = results;
        if (executed == total) {
          taskCallback(null, tasks);
        }
      });
    }, index * 500, task);
    timeouts.push(timeout);
  });
  /*async.every(intervals, function (interval, intervalTaskCallback) {
    async.every(compareSets, function (compareSet, intervalCompareSetTaskCallback) {
      var dashboardDateRange = {
        from: interval.from,
        to: interval.to
      };
      dashboardTask(compareSet, dashboardDateRange, function (err, results) {
        if (err) {
          return intervalCompareSetTaskCallback(err, null);
        }
        interval.addDashboard(compareSet.name, results);
        intervalCompareSetTaskCallback(null, true);
      });
    }, function (err, results) {
      if (err) {
        return intervalTaskCallback(err, null);
      }
      intervalTaskCallback(null, true);
    });
  }, function (err, results) {
    if (err) {
      return taskCallback(err, null);
    }
    taskCallback(null, intervals);
  });*/
}

function buildReportExtDict(tasks) {
  var intervalDict = {};
  tasks.forEach(function (task) {
    var interval = task.interval;
    if (intervalDict[interval.from]) {
      intervalDict[interval.from].dashboards = utils._extend(intervalDict[interval.from].dashboards, interval.dashboards);
    } else {
      intervalDict[interval.from] = utils._extend({}, interval);
    }
  });
  return intervalDict;
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

function calculatePeriodArray(dateRange, period, periodUnit) {
  var base = period; // second
  var unit = parseInt(periodUnit);
  var multiplier = 0;
  var interval = 0;
  var periodArr = [];
  switch (unit) {
    case AppEnum.PeriodUnit.Minute:
      multiplier = 60;
      break;
    case AppEnum.PeriodUnit.Hour:
      multiplier = 60 * 60;
      break;
    case AppEnum.PeriodUnit.Day:
      multiplier = 60 * 60 * 24;
      break;
    case AppEnum.PeriodUnit.Week:
      multiplier = 60 * 60 * 24 * 7;
      break;
    case AppEnum.PeriodUnit.Month:
    default:
      throw Error(`Not supported unit ${periodUnit}`);
  }
  interval = base * multiplier;

  for (var i = dateRange.from; ; i += interval) {
    var pDateRange = {
      from: i,
      to: i + interval
    };
    var period = new AnalyticsReportPeriodModel(pDateRange);
    periodArr.push(period);
    if (pDateRange.to >= dateRange.to) {
      break;
    }
  }
  return periodArr;
}