const fs = require('fs');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const MODEL = 'gemini-3.1-flash-lite';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`;

// Read API key from env (support multiple common names)
const API_KEY = process.env.Gemini_API_Key || process.env.GEMINI_API_KEY || process.env.GENERATIVE_API_KEY || process.env.GEMINI_APIKEY;

async function generateText(prompt, opts = {}) {
    const generationConfig = {
        maxOutputTokens: opts.maxOutputTokens ?? 65536,
        temperature: opts.temperature ?? 0.0
    };

    const body = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ],
        generationConfig
    };

    // Debug: show generation config being sent (no API key printed)
    if (process.env.NODE_ENV !== 'production') {
        try { console.log('[gemini] generationConfig:', JSON.stringify(generationConfig)); } catch (e) { /* ignore */ }
    }

    try {
        let data;

        // Prefer API key if provided (simpler for local testing).
        // Try query param first, then header fallback if that fails.
        if (API_KEY) {
            const urlWithKey = `${API_URL}?key=${API_KEY}`;
            console.log('[gemini] POST url (query): (masked)');
            try {
                const res = await axios.post(urlWithKey, body, { headers: { 'Content-Type': 'application/json' }, timeout: opts.timeout || 20000 });
                console.log('[gemini] response status (query):', res.status);
                data = res.data;
            } catch (errQuery) {
                console.warn('[gemini] query-param failed:', errQuery.response?.status, errQuery.response?.data);
                // If query-param method failed, try sending API key as header
                try {
                    console.log('[gemini] POST url (header):', API_URL);
                    const res2 = await axios.post(API_URL, body, { headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY }, timeout: opts.timeout || 20000 });
                    console.log('[gemini] response status (header):', res2.status);
                    data = res2.data;
                } catch (errHeader) {
                    console.warn('[gemini] header attempt failed:', errHeader.response?.status, errHeader.response?.data);
                    // Prefer the more informative error detail if available
                    const detail = errHeader.response?.data || errQuery.response?.data || errHeader.message || errQuery.message || errHeader;
                    throw new Error(`Gemini API error: ${JSON.stringify(detail)}`);
                }
            }
        } else {
            // Fallback to Application Default Credentials (service account)
            const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
            const client = await auth.getClient();
            const res = await client.request({ url: API_URL, method: 'POST', data: body });
            data = res.data;
        }

        // Best-effort extraction of generated text (API response shapes vary)
        let text = null;
        if (data?.candidates && data.candidates.length) {
            // Extract text from candidates -> content.parts[].text when available
            const pieces = data.candidates.map(cand => {
                const content = cand?.content;
                if (!content) return '';
                // content.parts is the usual shape: [{ text: '...' }, ...]
                if (Array.isArray(content.parts)) {
                    return content.parts.map(p => (typeof p === 'string' ? p : (p?.text ?? ''))).join('');
                }
                // fallback: content may be a plain string or have a 'text' field
                if (typeof content === 'string') return content;
                return content.text ?? JSON.stringify(content);
            });
            text = pieces.filter(Boolean).join('\n');
        } else if (Array.isArray(data?.output) && data.output[0]?.content) {
            // handle content as string or array
            const content = data.output[0].content;
            if (Array.isArray(content)) {
                text = content.map(chunk => (typeof chunk === 'string' ? chunk : chunk.text || '')).join('');
            } else {
                text = content;
            }
        } else if (typeof data?.content === 'string') {
            text = data.content;
        } else if (typeof data === 'string') {
            text = data;
        } else {
            text = JSON.stringify(data);
        }

        return { text, raw: data };
    } catch (err) {
        // Normalize axios / google-auth errors
        const detail = err.response?.data || err.message || err;
        throw new Error(`Gemini API error: ${JSON.stringify(detail)}`);
    }
}

module.exports = { generateText };
