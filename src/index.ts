#!/usr/bin/env node

import { Logger } from "./log";
import { Config } from "./config/schema";
import { simpleParser } from "mailparser";
import * as Pushover from "pushover-notifications";
import { SMTPServer } from "smtp-server";

const config = Config();
const logger = new Logger(config);

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

    logger.LogInfo(`Subject -> ${subject}`);
    logger.LogInfo(`Text -> ${body}`);  

    for ( var i = 0, l = appToken.length; i < l; i++ ) {
      const push = new Pushover({
        user: config.pushoverConfig.userToken,
        token: appToken[i],
        onerror: function(err) {
          if ( err ) {
            logger.LogInfo(`Error ${err}`); 
            return callback(new Error(err));
          }          
        }
      });
  
      const msg ={
        html: 1,
        title: subject,
        message: body
      };

      push.send( msg, ( _err, result ) => logger.LogInfo(`Result -> ${result}`));
    }

    return callback();
  },
});

server.on("error", (err) => {
  logger.LogInfo(`Error ${err.message}`);
});

server.listen(config.smtpConfig.port);