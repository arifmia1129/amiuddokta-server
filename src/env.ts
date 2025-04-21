// env.ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    // Add any other environment variables you need
    NODE_ENV: z.enum(["development", "production"]),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
  },
});

export default env;
