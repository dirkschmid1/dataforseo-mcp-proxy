const AUTH_SECRET = process.env.AUTH_SECRET || '';
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS')
        return res.status(204).end();
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    const { grant_type, code, refresh_token } = req.body || {};
    if (grant_type === 'authorization_code') {
        try {
            const decoded = JSON.parse(Buffer.from(code || '', 'base64url').toString());
            if (decoded.secret !== AUTH_SECRET || Date.now() > decoded.exp) {
                return res.status(401).json({ error: 'invalid_grant' });
            }
        }
        catch {
            return res.status(401).json({ error: 'invalid_grant' });
        }
        return res.json({
            access_token: AUTH_SECRET,
            token_type: 'Bearer',
            expires_in: 86400 * 365,
            refresh_token: `refresh_${AUTH_SECRET}`,
        });
    }
    if (grant_type === 'refresh_token') {
        if (refresh_token !== `refresh_${AUTH_SECRET}`) {
            return res.status(401).json({ error: 'invalid_grant' });
        }
        return res.json({
            access_token: AUTH_SECRET,
            token_type: 'Bearer',
            expires_in: 86400 * 365,
            refresh_token: `refresh_${AUTH_SECRET}`,
        });
    }
    return res.status(400).json({ error: 'unsupported_grant_type' });
}
//# sourceMappingURL=token.js.map