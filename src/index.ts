#!/usr/bin/env node

const Config = require("./config/schema").Config;
const simpleParser = require("mailparser").simpleParser;
const Push = require("pushover-notifications");
const SMTPServer = require("smtp-server").SMTPServer;

const config = Config()

function log(message: string) {
  if(config.smtpConfig.logger) {
    console.log(message);
  }
}

const server = new SMTPServer({
  authOptional: config.smtpConfig.authOptional,
  secure: config.smtpConfig.secure,
  allowInsecureAuth: config.smtpConfig.allowInsecureAuth,
  disabledCommands: config.smtpConfig.disabledCommands ?? [],
  logger: config.smtpConfig.logger,

  async onData(stream, _session, callback) {
    const parsed = await simpleParser(stream);

    const subject = (parsed.subject ?? "").trim();
    let body = parsed.html ?? "";

    if(!body) {
      body = parsed.text;
    }

    let address = "";

    if(Array.isArray(parsed.to)) {
      address = parsed.to.map(addrObj => addrObj.text).join(',');
    } else {
      address = parsed.to?.text;
    }

    let appToken = address.split(',').map(token => token.trim().split('@')[0]);

    if(config.pushoverConfig.appTokens && Array.isArray(config.pushoverConfig.appTokens)) {
      appToken = config.pushoverConfig.appTokens;
    }

    log(`Subject -> ${subject}`);
    log(`Text -> ${body}`);  

    for ( var i = 0, l = appToken.length; i < l; i++ ) {
      const push = new Push({
        user: config.pushoverConfig.userToken,
        token: appToken[i],
        onerror: function(err) {
          if ( err ) {
            log(`Error ${err}`); 
            return callback(new Error(err));
          }          
        }
      });
  
      const msg ={
        html: 1,
        title: subject,
        message: body
      };

      push.send( msg, function( _err, result ) {
        log(`Result -> ${result}`); 
        return callback();
      })
    }
  },
});

server.on("error", (err) => {
  log(`Error ${err.message}`);
});

server.listen(config.smtpConfig.port);