import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Define a schema for your environment variables
enum Environment {
    PROD = "PROD",
    STAGE = "STAGE"
}
const envSchema = z.object({
    ENVIRONMENT: z.nativeEnum(Environment),
    OVERRIDE_NAMESPACED_ENVS: z.string().optional(),
    DATABASE_NAME: z.string(),
    NOTIFICATION_API_URL: z.string(),
    // Add other env variables as needed
});

const parseAllEnv = (environment: Environment) => {
    const parsedEnv: Record<string, string> = {};
    const ENV_SUFFIX = `_${environment}`;
    const ENV_SUFFIX_REGEX = /_(PROD|STAGE)$/;
    const schemaVariableNames = Object.keys(envSchema.shape);

    for (const [envVarName, envVarValue] of Object.entries(process.env)) {
        if (envVarName.endsWith(ENV_SUFFIX)) {
            const variableName = envVarName.replace(ENV_SUFFIX, "");
            parsedEnv[variableName] = envVarValue || "";
        } else if (schemaVariableNames.includes(envVarName)) {
            parsedEnv[envVarName] = envVarValue || "";
        }
    }

    const overrideNamespacedEnvs = process.env.OVERRIDE_NAMESPACED_ENVS && process.env.OVERRIDE_NAMESPACED_ENVS?.split(",").map((envName) => envName.trim()) || [];
    overrideNamespacedEnvs.forEach((envVarName) => {
        const variableName = envVarName.replace(ENV_SUFFIX_REGEX, "");
        parsedEnv[variableName] = process.env[envVarName] || "";
    });

    envSchema.parse(parsedEnv);
    return parsedEnv;
}

export default parseAllEnv(process.env.ENVIRONMENT as Environment);
