import { AppConfig } from "./config/schema";

export class Logger{
    constructor(private config: AppConfig) { }

    LogInfo(message: string) {
        if(this.config.smtpConfig.logger && message) {
            console.log(message);
        }
    }
}