// c:/MovieNexus/api/chat.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Only POST is supported.' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body. "messages" array is required.' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
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

    // Map messages to Gemini API format (role must be 'user' or 'model')
    const contents = messages.map(msg => ({
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return res.status(response.status).json({ error: 'Failed to communicate with Gemini API', details: errText });
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(500).json({ error: 'Empty response from Gemini API.' });
    }

    // Since responseMimeType is application/json, responseText is a JSON string.
    // Parse it to ensure correctness, and return it directly.
    const jsonResponse = JSON.parse(responseText);
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Serverless Function Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
