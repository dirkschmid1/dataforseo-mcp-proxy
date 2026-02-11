import crypto from 'crypto';
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS')
        return res.status(204).end();
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    const { client_name, redirect_uris } = req.body || {};
    return res.status(201).json({
        client_id: `client_${crypto.randomBytes(16).toString('hex')}`,
        client_secret: `secret_${crypto.randomBytes(32).toString('hex')}`,
        client_name: client_name || 'MCP Client',
        redirect_uris: redirect_uris || [],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_post',
    });
}
//# sourceMappingURL=register.js.map