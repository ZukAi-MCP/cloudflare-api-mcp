# cloudflare-api-mcp

This is a lightweight Model Control Protocol (MCP) server bootstrapped with [create-mcp](https://github.com/zueai/create-mcp) and deployed on Cloudflare Workers.

This MCP server allows agents (such as Cursor) to interface with the [Cloudflare REST API](https://developers.cloudflare.com/api/).

It's still under development, I will be adding more tools as I find myself needing them.

## Available Tools

See [src/index.ts](src/index.ts) for the current list of tools. Every method in the class is an MCP tool.

## Installation

1. Run the automated install script to clone this MCP server and deploy it to your Cloudflare account:

```bash
bun create mcp --clone https://github.com/zueai/cloudflare-api-mcp
```

2. Open `Cursor Settings -> MCP -> Add new MCP server` and paste the command that was copied to your clipboard.

3. Upload your Cloudflare API key and email to your worker secrets:

```bash
bunx wrangler secret put CLOUDFLARE_API_KEY
bunx wrangler secret put CLOUDFLARE_API_EMAIL
```

## Local Development

Add your Cloudflare API key and email to the `.dev.vars` file:

```bash
CLOUDFLARE_API_KEY=<your-cloudflare-api-key>
CLOUDFLARE_API_EMAIL=<your-cloudflare-api-email>
```

## Deploying

1. Run the deploy script:

```bash
bun run deploy
```

2. Reload your Cursor window to see the new tools.

## How to Create New MCP Tools

To create new MCP tools, add methods to the `MyWorker` class in `src/index.ts`. Each function will automatically become an MCP tool that your agent can use.

Example:

```typescript
/**
 * Create a new DNS record in a zone.
 * @param zoneId {string} The ID of the zone to create the record in.
 * @param name {string} The name of the DNS record.
 * @param content {string} The content of the DNS record.
 * @param type {string} The type of DNS record (CNAME, A, TXT, or MX).
 * @param comment {string} Optional comment for the DNS record.
 * @param proxied {boolean} Optional whether to proxy the record through Cloudflare.
 * @return {object} The created DNS record.
 */
createDNSRecord(zoneId: string, name: string, content: string, type: string, comment?: string, proxied?: boolean) {
    // Implementation
}
```

The JSDoc comments are important:

- First line becomes the tool's description
- `@param` tags define the tool's parameters with types and descriptions
- `@return` tag specifies the return value and type

## Learn More

- [Model Control Protocol Documentation](https://modelcontextprotocol.io)
- [create-mcp Documentation](https://github.com/zueai/create-mcp)
- [workers-mcp](https://github.com/cloudflare/workers-mcp)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
