// Vercel serverless entry: bundled to api/index.js (see "build:api" script).
import { startServer } from "./server.ts";

const app = await startServer();
export default app;
