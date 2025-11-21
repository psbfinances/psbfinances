/**
 * Split Transaction Tool
 * Splits a transaction into multiple child transactions or keeps it as-is
 */

export const splitTransactionTool = {
  name: 'split_transaction',
  description: 'Split a transaction into multiple child transactions (e.g., separate supplies from inventory). If only one split is provided or the transaction should not be split, it can update the single transaction. Each child must have amount, and optionally categoryId, businessId, and note.',
  inputSchema: {
    type: 'object',
    properties: {
      transactionId: {
        type: 'string',
        description: 'The ID of the transaction to split',
      },
      childTransactions: {
        type: 'array',
        description: 'Array of child transactions. Each child must have amount (as decimal number like 50.00), and optionally categoryId, businessId, and note. The sum of child amounts must equal the parent transaction amount. If empty array, removes existing splits.',
        items: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Amount for this split (as decimal, e.g., 50.00)',
            },
            categoryId: {
              type: 'string',
              description: 'Category ID for this split (optional)',
            },
            businessId: {
              type: 'string',
              description: 'Business ID for this split (optional, use null or omit for personal)',
            },
            note: {
              type: 'string',
              description: 'Note for this split (optional, max 500 chars)',
            },
          },
          required: ['amount'],
        },
      },
    },
    required: ['transactionId', 'childTransactions'],
  },
};

export async function handleSplitTransaction(apiClient, args) {
  const { transactionId, childTransactions } = args;

  // Validate and format child transactions
  const formattedChildren = childTransactions.map(child => {
    const formatted = {
      amount: parseFloat(child.amount),
    };

    if (child.categoryId !== undefined && child.categoryId !== null) {
      formatted.categoryId = child.categoryId;
    }

    if (child.businessId !== undefined && child.businessId !== null) {
      formatted.businessId = child.businessId;
    }

    if (child.note) {
      formatted.note = child.note.substring(0, 500); // Enforce max length
    }

    return formatted;
  });

  // Call API to split transaction
  const response = await apiClient.patch(`/api/transactions/${transactionId}`, {
    childTransactions: formattedChildren,
  });

  const { transaction, children } = response.data;

  // Format response
  let resultText = `Transaction ${transactionId} `;

  if (!children || children.length === 0) {
    resultText += 'splits removed (if any existed).\n\n';
    resultText += `Transaction Details:\n`;
    resultText += `  Amount: $${(transaction.amount / 100).toFixed(2)}\n`;
    resultText += `  Category: ${transaction.categoryId || 'None'}\n`;
    resultText += `  Business: ${transaction.businessId || 'None'}`;
  } else {
    resultText += `successfully split into ${children.length} child transaction(s):\n\n`;

    children.forEach((child, idx) => {
      resultText += `${idx + 1}. Amount: $${(child.amount / 100).toFixed(2)}\n`;
      resultText += `   Category: ${child.categoryId || 'None'}\n`;
      resultText += `   Business: ${child.businessId || 'None'}\n`;
      resultText += `   Note: ${child.note || 'None'}\n`;
      if (idx < children.length - 1) resultText += '\n';
    });

    // Calculate total
    const total = children.reduce((sum, c) => sum + c.amount, 0);
    resultText += `\nTotal: $${(total / 100).toFixed(2)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: resultText,
      },
    ],
  };
}
