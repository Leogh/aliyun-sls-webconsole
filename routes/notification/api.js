/**
 * Created by Roman Lo on 6/1/2016.
 */

var express = require('express');
var router = express.Router();

// API route registries

require('./observer-api')(router);
require('./observer-group-api')(router);
require('./watcher-api')(router);
require('./watcher-group-api')(router);
require('./rule-api')(router);
require('./pool-config-api')(router);

require('./simple-rule-api')(router);

module.exports = router;