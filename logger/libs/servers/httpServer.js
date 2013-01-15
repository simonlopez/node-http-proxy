/**
 * http log server
 */

var http = require('http'),
    url = require('url'),
    levels = require('../levels');

var isDebug = false;
var server = function(config, loggers) {
  var message;

  // initialization check
  if(config) {
    isDebug = config.debug?true:false;
  }
  else {
    message = "[httpServer] config is mandatory";
  }

  if(config.httpServer) {
    if(config.httpServer.debug)
      isDebug = true;
    else if(config.httpServer.debug === false)
      isDebug = false;
    if(!config.httpServer.port) {
      message = "[httpServer] config.httpServer.port is undefined";
    } else if(!loggers) {
      message = "[httpServer] logger is mandatory";
    }
  }
  else {
    message = "[httpServer] config.httpServer is undefined";
  }

  if(message) {
    if(isDebug) console.error(message);
    throw new Error({
      message: message
    });
  }

  http.createServer(function(req,res) {
    var _code = 200;
    var _message = 'OK';
    var level = null;
    var source = null;
    var message = null;
    if(req.method=='GET') {
      if(isDebug) {
        console.log("[httpServer] request: "+req.url);
      }
      query = url.parse(req.url,true).query;
      source = query.source;
      message = query.message;
      level = isNaN(query.level)?-1:+query.level;
      if(!level) level = 1;
      if(!levels[level]) {
        _code = 400;
        _message = "Unknown logLevel";
      }
    } else {
      _code = 405;
      _message = "Method Not Allowed";
    }
    if(!source || !message) {
      _code = 412;
      _message = "Missing parameters";
    }
    
    if(_code===200) {
      for(var logger in loggers) {
        loggers[logger].log(level,source,message);
      }
    }
    if(isDebug) {
      console.log("[httpServer] Return: ");
      console.log("[httpServer]  code: "+_code);
      console.log("[httpServer]  msg : "+_message);
    }
    res.writeHeader(_code, {"Content-Type": "text/plain"});
    res.write(_message+"\n");
    res.end();

  }).listen(parseInt(config.httpServer.port,10));
}

module.exports = {
  Name  : 'httpLogServer',
  Server: server
}
