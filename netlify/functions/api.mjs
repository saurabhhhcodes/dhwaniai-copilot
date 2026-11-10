// Netlify Functions wrapper for the Express backend (server.mjs).
// Runs the same API endpoints (STT / TTS / chat / health) as a Lambda.
import serverless from 'serverless-http';

// Flag consumed by server.mjs to prevent it from opening an HTTP server socket
process.env.NETLIFY_FUNCTIONS = 'true';

// Dynamic import AFTER setting the flag (ESM imports are hoisted, so async import is required)
const { default: app } = await import('../../server.mjs');

export const handler = serverless(app);
