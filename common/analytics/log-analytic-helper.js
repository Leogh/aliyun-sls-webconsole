/**
 * Created by Roman Lo on 5/17/2016.
 */

exports.constructAnalyticTask = function (compareSet, aliyunSlsInst){
    var task = {
        full: function () {},
        sub: function () {},
    };
    return task;
};

function getFullRecord(fullRecordQuery, callBack, sls) {
    sls.getHistograms({
        //必选字段
        projectName: 'didamonitor',//data.projectName,
        logStoreName:  'monitor', //data.logStoreName,
        from: from, //开始时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)
        to: to,    //结束时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)

        //以下为可选字段
        topic: 'Monitoring', //topic,      //指定日志主题(用户所有主题可以通过listTopics获得)
        query: fullRecordQuery,
    }, function (err, data) {
        if (err) {
            logger.warn('error occurs when calling Aliyun SLS API.', err.code, err.errorMessage || err.message);
            return callBack(err, false);
        }
        var count = data.headers['x-log-count'];
        callBack(null, count);
    });
}


