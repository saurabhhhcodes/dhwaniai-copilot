// Netlify Functions wrapper for the Express backend (server.mjs).
// Runs the same API endpoints (STT / TTS / chat / health) as a Lambda.
import serverless from 'serverless-http';
import app from '../../server.mjs';

export const handler = serverless(app);
