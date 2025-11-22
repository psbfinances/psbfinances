# psbFinances MCP Server

Model Context Protocol (MCP) server for psbFinances that enables Claude (and other AI assistants) to interact with your financial transactions.

## Features

This MCP server provides four main tools:

1. **find_transaction** - Search for transactions by account, date range, and description
2. **split_transaction** - Split an existing transaction into multiple child transactions (e.g., separate supplies from inventory)
3. **create_transaction** - Create a new manual transaction, optionally with splits (for processing invoices before bank transactions post)
4. **attach_file** - Upload and attach files (invoices, receipts) to transactions

## Installation

### 1. Install Dependencies

From the `mcp-server` directory:

```bash
npm install
```

### 2. Configure the Server

Create a `config.json` file by copying the example:

```bash
cp config.example.json config.json
```

Edit `config.json` with your settings:

```json
{
  "apiBaseUrl": "http://localhost:3001",
  "jwtToken": "your-jwt-token-here",
  "allowedFilePaths": [
    "/tmp",
    "/Users/you/Downloads",
    "/absolute/path/to/psbfinance/files"
  ]
}
```

**Getting your JWT token:**

1. Start your psbFinances server
2. Log in to the web interface
3. Open browser DevTools (F12) → Application → Local Storage
4. Find the `token` or `authToken` key and copy its value
5. Paste it into `config.json`

**Allowing file uploads:** Claude/ChatGPT needs a safe place to drop uploaded invoices. Add any directories where uploads may appear to `allowedFilePaths` (e.g., `/tmp`, your `Downloads` folder, or the repo's `files` directory). The MCP server will only read attachments from these paths.

### 3. Add to Claude Desktop

Add the MCP server to Claude Desktop's configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

Add this entry to the `mcpServers` section:

```json
{
  "mcpServers": {
    "psbfinance": {
      "command": "node",
      "args": ["/absolute/path/to/psbfinance/mcp-server/src/index.js"]
    }
  }
}
```

**Important:** Use the absolute path to your `index.js` file.

### 4. Restart Claude Desktop

Close and reopen Claude Desktop for the changes to take effect.

## Usage

Once configured, you can use natural language to interact with your transactions:

### Example: Processing an Invoice

```
Upload this invoice (attach image/PDF) for my hair salon supplies.
Account: Business Checking
Vendor: Beauty Wholesale Co

The invoice shows:
- $150.00 in supplies (taxable)
- $250.00 in inventory for resale (non-taxable)

Please find the transaction and split it accordingly, then attach this invoice.
```

Claude will:
1. Use `find_transaction` to search for the transaction
2. Use `split_transaction` to split it into supplies and inventory
3. Use `attach_file` to upload and attach the invoice

### Example: Simple Transaction Search

```
Find all transactions in my Business Checking account from last week
with "Costco" in the description
```

### Example: Splitting a Transaction

```
Split transaction ID abc123 into:
- $75.00 for office supplies (category: supplies-123)
- $125.00 for business meals (category: meals-456, business: biz-789)
```

## Available Tools

### find_transaction

Search for transactions by account, date range, and/or description.

**Parameters:**
- `accountId` (required) - The account ID to search in
- `startDate` (optional) - Start date (YYYY-MM-DD), defaults to 30 days ago
- `endDate` (optional) - End date (YYYY-MM-DD), defaults to today
- `search` (optional) - Text to search in description
- `limit` (optional) - Max results, default 50

### split_transaction

Split a transaction into multiple child transactions.

**Parameters:**
- `transactionId` (required) - The transaction ID to split
- `childTransactions` (required) - Array of splits, each with:
  - `amount` (required) - Amount as decimal (e.g., 50.00)
  - `categoryId` (optional) - Category ID
  - `businessId` (optional) - Business ID (omit for personal)
  - `note` (optional) - Note for this split (max 500 chars)

**Note:** The sum of all child amounts must equal the parent transaction amount.

### create_transaction

Create a new manual transaction (source='m'), optionally with splits. Use this when processing invoices before the bank transaction has posted.

**Parameters:**
- `accountId` (required) - The account ID where this transaction should be created
- `postedDate` (required) - Transaction date (YYYY-MM-DD format)
- `description` (required) - Transaction description (max 150 chars)
- `amount` (optional) - Total transaction amount as decimal (e.g., 200.50). Required unless childTransactions are provided
- `categoryId` (optional) - Category ID. Omit if using splits
- `businessId` (optional) - Business ID. Omit or set to null for personal
- `note` (optional) - Note for the transaction (max 500 chars)
- `childTransactions` (optional) - Array of splits, each with:
  - `amount` (required) - Amount as decimal (e.g., 50.00)
  - `categoryId` (optional) - Category ID
  - `businessId` (optional) - Business ID (omit for personal)
  - `note` (optional) - Note for this split (max 500 chars)

**Note:** If childTransactions are provided, the sum must equal the total amount. The transaction will be created and immediately split in one operation.

### attach_file

Upload and attach a file to a transaction.

**Parameters:**
- `transactionId` (required) - The transaction ID
- `fileName` (required) - Original filename (e.g., "invoice.pdf")
- `fileData` (required) - Base64-encoded file content
- `mimeType` (optional) - MIME type (auto-detected from filename if not provided)

## Troubleshooting

### "Error loading config.json"

Make sure you've created `config.json` from the example and filled in your settings.

### "401 Unauthorized" or authentication errors

Your JWT token may have expired. Get a fresh token from the browser and update `config.json`.

### "Connection refused" errors

Ensure your psbFinances server is running on the URL specified in `config.json`.

### MCP server not appearing in Claude

1. Check that the path in `claude_desktop_config.json` is absolute and correct
2. Restart Claude Desktop completely
3. Check Claude Desktop logs for errors (usually in ~/Library/Logs/Claude/)

## Development

Run in development mode with auto-reload:

```bash
npm run dev
```

## Architecture

- **Transport:** stdio (standard input/output for local MCP servers)
- **Protocol:** Model Context Protocol (MCP) 1.0
- **API Client:** Axios with JWT bearer authentication
- **Tools:** Four specialized tools wrapping psbFinances REST API

## Security Notes

- The `config.json` file contains sensitive authentication tokens
- Keep `config.json` in `.gitignore` (already configured)
- Never commit your JWT token to version control
- The MCP server runs locally and only you can access it

## License

Same as parent project
