interface SmtpConfig {
    port: number | string;
    authOptional: boolean | string;
    secure: boolean | string;
    allowInsecureAuth: boolean | string;
    disabledCommands: string[];
    logger: boolean | string;
}

interface PushoverConfig {
    userToken: string;
}

interface ConfigSchema {
    smtpConfig: SmtpConfig;
    pushoverConfig: PushoverConfig;
}