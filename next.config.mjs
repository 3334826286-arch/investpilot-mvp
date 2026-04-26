import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const isStaticExport = process.env.INVESTPILOT_STATIC_EXPORT === "1";

/** @type {import("next").NextConfig} */
const nextConfig = {
  typedRoutes: false,
  outputFileTracingRoot: rootDir,
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true
        }
      }
    : {})
};

export default nextConfig;
