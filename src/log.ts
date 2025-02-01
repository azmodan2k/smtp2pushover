export class Logger{
    constructor(private config: ConfigSchema) { }

    LogInfo(message: any) {
        if(this.config.smtpConfig.logger && message) {
            console.log(message);
        }
    }

    LogError(message: any) {
        if(this.config.smtpConfig.logger && message) {
            console.error(message);
        }
    }    
}