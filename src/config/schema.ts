import { FromSchema } from "json-schema-to-ts";
import { readFileSync } from "node:fs";
import { mergePartially, NestedPartial } from 'merge-partially';

export const jsonSchema = {
    type: "object",
    properties: {
        smtpConfig: {
            type: "object",
            properties: {
                port: { type: "number", default: 25 },
                authOptional: { type: "boolean", default: true },
                secure: { type: "boolean", default: false },
                allowInsecureAuth: { type: "boolean", default: false },
                logger: { type: "boolean", default: true },
                disabledCommands: { type: "array", items: { type: "string" } }
            }
        },
        pushoverConfig: {
            type: "object",
            properties: {
                userToken: { type: "string" },
                appTokens: { type: "array", items: { type: "string" } }
            },
            required: [ "userToken" ]
        }
    },
    required: [
        "smtpConfig",
        "pushoverConfig"
    ],
    additionalProperties: false
  } as const;
  
export type AppConfig = FromSchema<typeof jsonSchema>;

export function Config() : AppConfig {
    const defaultAppConfig = {
        "smtpConfig": {
            "port": 25,
            "authOptional": true,
            "secure": false,
            "allowInsecureAuth": false,
            "logger": false,
            "disabledCommands": [
                "STARTTLS"
            ]
        },
        "pushoverConfig": {
            "userToken": "temp"
        }
    } as AppConfig;

    try {
        let config: AppConfig
        config = JSON.parse(readFileSync('/config.json', 'utf8')) as AppConfig;

        const mergedConfig = mergePartially.shallow(defaultAppConfig, config);

        return mergedConfig;
    } catch(e) {
        return defaultAppConfig;
    }
}