import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

import { readFileSync, existsSync } from 'node:fs';

// Load .env variables locally
if (existsSync('.env')) {
  try {
    const envConfig = readFileSync('.env', 'utf-8');
    for (const line of envConfig.split('\n')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (err) {
    console.error('Failed to read .env file:', err);
  }
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// Local /api/chat Gemini API proxy endpoint
app.post('/api/chat', express.json(), async (req, res) => {
  const GEMINI_API_KEY = process.env['GEMINI_API_KEY'];
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body. "messages" array is required.' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured locally.' });
    }

    const systemInstruction = `Eres un asistente experto en cine y recomendación de películas para la aplicación MovieNexus.
Tus respuestas deben cumplir con las siguientes reglas:
1. Responde siempre en español con un tono entusiasta, amigable y cinéfilo.
2. Formatea tu respuesta con el siguiente formato JSON estricto:
{
  "answer": "Tu respuesta en texto. Puedes usar Markdown (negritas, listas, etc.) para darle formato.",
  "recommendations": [
    {
      "title": "Nombre de la película recomendada",
      "reason": "Breve explicación de por qué la recomiendas"
    }
  ]
}
3. Si mencionas o recomiendas películas, debes incluirlas en la lista de 'recommendations' (máximo 5). Si no recomiendas ninguna, la lista debe estar vacía.
`;

    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Failed to communicate with Gemini API', details: errText });
    }

    const data: any = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(500).json({ error: 'Empty response from Gemini API.' });
    }

    const jsonResponse = JSON.parse(responseText);
    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('Local Express /api/chat error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
