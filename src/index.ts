#!/usr/bin/env node
import confData from "./config/config.json"
import { Logger } from "./log";
import { simpleParser } from "mailparser";
import * as Pushover from "pushover-notifications";
import { SMTPServer } from "smtp-server";

const { smtp_port, smtp_authOptional, smtp_secure, smtp_allowInsecureAuth, smtp_disabledCommands, smtp_logger, pushover_usertoken } = process.env;
let config = confData as ConfigSchema;

config.pushoverConfig.userToken = pushover_usertoken || config.pushoverConfig.userToken;
config.smtpConfig.port = smtp_port || config.smtpConfig.port || 25;
config.smtpConfig.authOptional = smtp_authOptional || config.smtpConfig.authOptional || true;
config.smtpConfig.secure = smtp_secure || config.smtpConfig.secure || false;
config.smtpConfig.allowInsecureAuth = smtp_allowInsecureAuth || config.smtpConfig.allowInsecureAuth || false;
config.smtpConfig.disabledCommands = smtp_disabledCommands?.split(',').map(m => m.trim()) || config.smtpConfig.disabledCommands || [];
config.smtpConfig.logger = smtp_logger || config.smtpConfig.logger || true;

const logger = new Logger(config);

console.log(config);

if(!config.pushoverConfig.userToken) {
  logger.LogWarning("you have to provide a userToken");
} else {
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
  
      // if(config.pushoverConfig.appTokens && Array.isArray(config.pushoverConfig.appTokens)) {
      //   appToken = config.pushoverConfig.appTokens;
      // }
  
      logger.LogInfo(`Subject -> ${subject}`);
      logger.LogInfo(`Text -> ${body}`);  
  
      for ( var i = 0, l = appToken.length; i < l; i++ ) {
        try {
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
        } catch (error) {
          logger.LogError(error);
        }
      }
  
      return callback();
    },
  });
  
  server.on("error", (err) => {
    logger.LogInfo(`Error ${err.message}`);
  });
  
  server.listen(config.smtpConfig.port);
}