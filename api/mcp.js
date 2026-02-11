import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { initMcpServer } from '../src/main/init-mcp-server.js';
import { initializeFieldConfiguration } from '../src/core/config/field-configuration.js';
const AUTH_SECRET = process.env.AUTH_SECRET || '';
initializeFieldConfiguration();
function extractBearerToken(authorization) {
    const m = authorization?.match(/^Bearer\s+(.+)$/i);
    return m?.[1]?.trim();
}
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
    if (req.method === 'OPTIONS')
        return res.status(204).end();
    // GET → Discovery
    if (req.method === 'GET') {
        return res.status(200).json({
            name: 'DataForSEO MCP Server',
            version: '1.0.0',
            protocol: 'streamable-http',
            endpoints: { mcp: '/mcp' },
            status: 'running'
        });
    }
    // Auth check
    if (AUTH_SECRET) {
        const bearer = extractBearerToken(req.headers.authorization);
        if (bearer !== AUTH_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    const username = process.env.DATAFORSEO_USERNAME;
    const password = process.env.DATAFORSEO_PASSWORD;
    if (!username || !password) {
        return res.status(500).json({ error: 'DataForSEO credentials not configured' });
    }
    const server = initMcpServer(username, password);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    let cleaned = false;
    const cleanup = async () => {
        if (cleaned)
            return;
        cleaned = true;
        try {
            await transport.close();
        }
        catch { }
        try {
            await server.close();
        }
        catch { }
    };
    res.on('close', () => void cleanup().catch(console.error));
    res.on('finish', () => void cleanup().catch(console.error));
    try {
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    }
    catch (err) {
        console.error('MCP Server Error:', err);
        void cleanup().catch(console.error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
//# sourceMappingURL=mcp.js.map