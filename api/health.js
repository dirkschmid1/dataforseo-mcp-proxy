export default function handler(_req, res) {
    res.json({
        name: 'DataForSEO MCP Server',
        version: '1.0.0',
        endpoints: { mcp: '/mcp' },
        status: 'running',
        host: 'vercel'
    });
}
//# sourceMappingURL=health.js.map