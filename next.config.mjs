import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // We share a machine with other lockfiles; pin the root to this project.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
