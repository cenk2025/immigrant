// Server-side proxy for DeepSeek chat completions.
// Keeps DEEPSEEK_API_KEY out of the client bundle — set it as a
// (non-VITE_ prefixed) environment variable in the Vercel project settings.

export const config = { runtime: 'nodejs' };

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'AI feature is not configured' });
        return;
    }

    const { messages, temperature, max_tokens } = req.body ?? {};
    if (!Array.isArray(messages)) {
        res.status(400).json({ error: 'messages array is required' });
        return;
    }

    try {
        const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                temperature: temperature ?? 0.7,
                max_tokens: max_tokens ?? 800,
            }),
        });

        const data = await upstream.json();
        res.status(upstream.status).json(data);
    } catch (error) {
        console.error('DeepSeek proxy error:', error);
        res.status(502).json({ error: 'Failed to reach AI service' });
    }
}
