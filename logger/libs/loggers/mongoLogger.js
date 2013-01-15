/**
 * Mongo logger
 */

var mongoose = require('mongoose'),
    levels = require('../levels');
var schema = {
  received: {type: Date, default: Date.now},
  source  : {type: String, required: true},
  message : {type: String, required: true}
}
var logEntry = mongoose.model("logEntry", mongoose.Schema(schema));


var logger = function(config) {
  var message;

  this.isDebug = false;

  // initialization check
  if(!config) {
    message = "[mongoLogger] config is mandatory";
    console.error(message);
    throw new Error({
      message: message
    });
  }

  this.isDebug = config.debug?true:false;

  if(!config.mongoLogger) {
    message = "[mongoLogger] config.mongoLogger is undefined";
    if(this.isDebug) console.error(message);
    throw new Error({
      message: message
    });
  }
  if(config.mongoLogger.debug)
    this.isDebug = true;
  else if(config.mongoLogger.debug===false)
    this.isDebug = false;

  if (!config.mongoLogger.base) {
    message = "[mongoLogger] config.mongoLogger.base is undefined";
    if(this.isDebug) console.error(message);
    throw new Error({
      message: message
    });
  }

  var conf = config.mongoLogger;

  this.level = config.logLevel?config.logLevel:1;
  if(conf.logLevel)
    this.level = conf.logLevel;
  if(this.isDebug)
    console.error("[mongoLogger] logLevel: "+this.level);

  var con = "mongodb://";
  if(conf.user) {
    con+=conf.user+(conf.pass?":"+conf.pass:"")+"@";
  }
  con += conf.host?conf.host:'127.0.0.1';
  con += ":" + (conf.port?conf.port:27017);
  con += "/" + conf.base;
  this.connection = mongoose.connect(con, function(err) {
    if (err) {
      this.connection = null;
      message = "[mongoLogger] Can't connect to mongo (" + connectionPath + "): " + err.message;
      if(this.isDebug) console.error(message);
      throw new Error({
        message: message,
        code: err.code
      });
    }
  });
}

logger.prototype = {
  log: function(level, source, message) {
    if(this.isDebug) console.log("[mongoLogger]["+source+"]["+level+"] '"+message+"'");
    if(!levels[level]) {
      if(this.isDebug) console.log("[mongoLogger] unknown level: "+level);
      return;
    }
    if(this.level<level) {
      if(this.isDebug) console.log("[mongoLogger] "+level+">"+this.level);
      return;
    }
    if(!this.connection) {
      if(this.isDebug) console.log("[mongoLogger] no database connection");
      return;
    }
    new logEntry({
      source: source,
      message: "["+levels[level]+"] "+message
    }).save(function(err, entry) {
      if(this.isDebug) {
        if(!entry)
          console.error("[mongoLogger]["+source+"] can't saves: '"+message);
        if(err) {
          console.error("[mongoLogger]["+source+"] can't saves: '"+message+"' with error: "+err.message);
        }
      }
    });
  }

}

module.exports = {
  Name  : 'mongoLogger',
  Logger : logger
}
