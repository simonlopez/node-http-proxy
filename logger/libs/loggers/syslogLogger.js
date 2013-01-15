/**
 * syslog logger
 */
var syslog = require('syslog');
    levels = require('../levels');

var client = null;
var isDebug = false;
var enabled = true;

var logger = function(config) {
  var message;

  // initialization check
  if(!config) {
    message = "[syslogLogger] config is mandatory";
    console.error(message);
    throw new Error({
      message: message
    });
  }

  isDebug = config.debug?true:false;

  if(!config.syslogLogger) {
    message = "[syslogLogger] config.syslogLogger is undefined";
    if(isDebug) console.error(message);
    throw new Error({
      message: message
    });
  }
  if(config.syslogLogger.debug)
    isDebug = true;
  else if(config.syslogLogger.debug===false)
    isDebug = false;

  if(config.syslogLogger.enabled === false)
    enabled = false;

  var host = config.syslogLogger.host?config.syslogLogger.host:'localhost';
  var port = config.syslogLogger.port?config.syslogLogger.port:514;

  this.level = config.logLevel?config.logLevel:1;
  if(!isNaN(config.syslogLogger.logLevel))
    this.level = config.syslogLogger.logLevel;
  if(isDebug) {
    console.error("[syslogLogger] host: "+host);
    console.error("[syslogLogger] port: "+port);
    console.error("[syslogLogger] logLevel: "+this.level);
  }

  client = syslog.createClient(port,host);
}

logger.prototype = {
  log: function(level, source, message) {
    if(!enabled)
      return;
    if(isDebug) console.log("[syslogLogger]["+source+"]["+level+"] '"+message+"'");
    if(!levels[level]) {
      if(isDebug) console.log("[syslogLogger] unknown level: "+level);
      return;
    }
    if(this.level<level) {
      if(isDebug) console.log("[syslogLogger] "+level+">"+this.level);
      return;
    }
    client.log(message, level);
  }

}

module.exports = {
  Name  : 'syslogLogger',
  Logger : logger
}
