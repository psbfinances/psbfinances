/**
 * Find Transaction Tool
 * Searches for transactions by account, date range, and description
 */

export const findTransactionTool = {
  name: 'find_transaction',
  description: 'Search for transactions in psbFinances by account, date range, and/or description. Returns matching transactions with their details.',
  inputSchema: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'The account ID to search in (required)',
      },
      startDate: {
        type: 'string',
        description: 'Start date for search range (YYYY-MM-DD format). Defaults to 30 days ago if not specified.',
      },
      endDate: {
        type: 'string',
        description: 'End date for search range (YYYY-MM-DD format). Defaults to today if not specified.',
      },
      search: {
        type: 'string',
        description: 'Text to search for in transaction description (optional)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 50)',
      },
    },
    required: ['accountId'],
  },
};

export async function handleFindTransaction(apiClient, args) {
  const { accountId, startDate, endDate, search, limit = 50 } = args;

  // Build query parameters - API expects dateFrom/dateTo
  const params = {
    accountId,
    limit,
  };

  if (startDate) params.dateFrom = startDate;
  if (endDate) params.dateTo = endDate;
  if (search) params.search = search;

  // Call API
  const response = await apiClient.get('/api/transactions', { params });

  // API returns { items: [...], openingBalance: 0 }
  const transactions = response.data.items || [];

  // Format response
  const resultText = transactions.length === 0
    ? 'No transactions found matching the criteria.'
    : `Found ${transactions.length} transaction(s):\n\n` +
      transactions.map((t, idx) =>
        `${idx + 1}. Transaction ID: ${t.id}\n` +
        `   Date: ${t.postedDate}\n` +
        `   Description: ${t.description}\n` +
        `   Amount: $${t.amount.toFixed(2)}\n` +
        `   Account: ${t.accountId}\n` +
        `   Category: ${t.categoryId || 'None'}\n` +
        `   Business: ${t.businessId || 'None'}\n` +
        `   Has Children: ${t.hasChildren ? 'Yes (already split)' : 'No'}\n` +
        `   Note: ${t.note || 'None'}`
      ).join('\n\n');

  return {
    content: [
      {
        type: 'text',
        text: resultText,
      },
    ],
  };
}
