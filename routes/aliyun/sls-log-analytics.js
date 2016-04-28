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
var slsUtils = require('../../common/aliyun-sls-utils');
var log4js = require('log4js');
var ALY = require("aliyun-sdk");
var logger = log4js.getLogger("aliyun.sls");

var User = require("../../models/user");
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

router.get('/analyticsField', function(req, res, next) {
  var queryOption = {
    hashing: ALY_LOG_ANALYTICS_ACCESS_HASH
  };
  if (typeof req.query.fieldName !== 'undefined') {
    queryOption.name = {
      $regex: req.query.fieldName,
    };
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

router.post('/analyticsField', function (req, res, next) {
  addOrUpdateAnalyticsField(res, null, req.query.fieldName, req.query.valueSet, 1);
});

router.put('/analyticsField', function (req, res, next) {
  addOrUpdateAnalyticsField(res, req.query._id, req.query.fieldName, req.query.valueSet, 1);
});

// analyticsCompareSet

router.get('/analyticsCompareSet', function (req, res, next) {
  var queryOption = {
    hashing: ALY_LOG_ANALYTICS_ACCESS_HASH
  };
  if (typeof req.query.compareSetName !== 'undefined') {
    queryOption.name = {
      $regex: req.query.compareSetName,
    };
  }
  AnalyticsCompareSet
    .find(queryOption)
    .exec(function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(result));
    });
});

router.post('/analyticsCompareSet', function (req, res, next) {  
  addOrUpdateAnalyticsCompareSet(res, null, res.query.compareSetName, 
    res.query.compareFieldName, res.query.groupFieldName, res.query.chartType, 1);  
});

router.put('/analyticsCompareSet', function (req, res, next) {  
  addOrUpdateAnalyticsCompareSet(res, res.query._id, res.query.compareSetName, 
    res.query.compareFieldName, res.query.groupFieldName, res.query.chartType, 1);  
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

function addOrUpdateAnalyticsCompareSet(res, _id, setName, compareFieldName, groupFieldName, chartType, status) {
  var isForAdd = !!_id;
  if(!isForAdd){
    if (!/\w+/.test(compareFieldName) || compareFieldName == null || typeof compareFieldName === 'undefined') {
      res.send(restResp.error(restResp.CODE_ERROR, 'compareFieldName cannot be empty'));
      return;
    }
    AnalyticsCompareSet.findOne({
      _id: _id,
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
  
  var asyncTsk = function (existedSet) {
    async.parallel({
      compareField: function (cb) {
        AnalyticsField
          .findOne({
            hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
            name: compareFieldName,
          })
          .exec(cb);
      },
      groupField: function (cb) {
        if (compareFieldName == null || typeof compareFieldName === 'undefined') {
          compareFieldName = '';
        }
        if (/\w+/.test(groupFieldName)) {
          AnalyticsField
            .findOne({
              hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
              name: groupFieldName,
            })
            .exec(cb);
        } else {
          cb(null, true);
        }
      }
    }, function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      if (!result.compareField) {
        res.send(restResp.error('Invalid compareFieldName'));
        return;
      }
      if (!result.groupField) {
        res.send(restResp.error('Invalid groupFieldName'));
        return;
      }
      
      if (existedSet) {
        // update 
        existedSet.name = setName || existedSet.name;
        existedSet.compareField = result.compareField === true ? existedSet.compareField._id : result.compareField._id;
        existedSet.groupField = result.groupField === true ? existedSet.groupField._id : result.groupField._id;
        existedSet.chartType = chartType || existedSet.chartType;
        existedSet.status = status;
        existedSet.save(function (err, result) {
          if (err) {
            utils.handleMongooseError(res, err);
            return;
          }
          res.send(restResp.success(result));
        });
      } else {
        // add
        var compareSet = new AnalyticsCompareSet({
          name: setName,
          hashing: ALY_LOG_ANALYTICS_ACCESS_HASH,
          compareField: result.compareField._id,
          groupField: result.groupField === true ? null : result.groupField._id,
          chartType: chartType,
          status: 1,
        });
        compareSet.save(function (err, result) {
          if (err) {
            utils.handleMongooseError(res, err);
            return;
          }
          res.send(restResp.success(result));
        });
      }      
    });
  };
}

