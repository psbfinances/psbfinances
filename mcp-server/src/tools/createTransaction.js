/**
 * Create Transaction Tool
 * Creates a new manual transaction, optionally with splits
 */

export const createTransactionTool = {
  name: 'create_transaction',
  description: 'Create a new manual transaction (source=m) in psbFinances. Use this when processing an invoice before the bank transaction has posted. Can optionally include splits for different expense categories (e.g., supplies vs inventory).',
  inputSchema: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'The account ID where this transaction should be created (required)',
      },
      postedDate: {
        type: 'string',
        description: 'Transaction date in YYYY-MM-DD format (required)',
      },
      description: {
        type: 'string',
        description: 'Transaction description, max 150 characters (required)',
      },
      amount: {
        type: 'number',
        description: 'Total transaction amount as decimal (e.g., 200.50). Required unless childTransactions are provided.',
      },
      categoryId: {
        type: 'string',
        description: 'Category ID for the transaction. Omit if using childTransactions (splits).',
      },
      businessId: {
        type: 'string',
        description: 'Business ID for the transaction. Omit or set to null for personal transactions.',
      },
      note: {
        type: 'string',
        description: 'Optional note for the transaction, max 500 characters',
      },
      childTransactions: {
        type: 'array',
        description: 'Optional array of splits. If provided, the transaction will be split into these child transactions. The sum of child amounts must equal the parent amount.',
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
              description: 'Business ID for this split (optional, omit for personal)',
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
    required: ['accountId', 'postedDate', 'description'],
  },
};

export async function handleCreateTransaction(apiClient, args) {
  const {
    accountId,
    postedDate,
    description,
    amount,
    categoryId,
    businessId,
    note,
    childTransactions,
  } = args;

  // Calculate total amount if splits are provided
  let totalAmount = amount;
  if (childTransactions && childTransactions.length > 0) {
    totalAmount = childTransactions.reduce((sum, child) => sum + parseFloat(child.amount), 0);
  }

  if (!totalAmount) {
    throw new Error('Either amount or childTransactions must be provided');
  }

  // Create the parent transaction
  const transactionData = {
    accountId,
    postedDate,
    description: description.substring(0, 150), // Enforce max length
    amount: totalAmount,
  };

  // Only include optional fields if provided and no splits
  if (!childTransactions || childTransactions.length === 0) {
    if (categoryId) transactionData.categoryId = categoryId;
    if (businessId) transactionData.businessId = businessId;
  }

  if (note) transactionData.note = note.substring(0, 500);

  // Create transaction
  const createResponse = await apiClient.post('/api/transactions', transactionData);
  let transaction = createResponse.data;

  // If splits provided, immediately split the transaction
  let children = null;
  if (childTransactions && childTransactions.length > 0) {
    const formattedChildren = childTransactions.map(child => ({
      amount: parseFloat(child.amount),
      categoryId: child.categoryId || null,
      businessId: child.businessId || null,
      note: child.note ? child.note.substring(0, 500) : undefined,
    }));

    const splitResponse = await apiClient.patch(`/api/transactions/${transaction.id}`, {
      childTransactions: formattedChildren,
    });

    transaction = splitResponse.data.transaction;
    children = splitResponse.data.children;
  }

  // Format response
  let resultText = `Manual transaction created successfully!\n\n`;
  resultText += `Transaction ID: ${transaction.id}\n`;
  resultText += `Date: ${transaction.postedDate}\n`;
  resultText += `Description: ${transaction.description}\n`;
  resultText += `Total Amount: $${(transaction.amount / 100).toFixed(2)}\n`;
  resultText += `Account: ${transaction.accountId}\n`;

  if (children && children.length > 0) {
    resultText += `\nSplit into ${children.length} parts:\n\n`;
    children.forEach((child, idx) => {
      resultText += `${idx + 1}. Amount: $${(child.amount / 100).toFixed(2)}\n`;
      resultText += `   Category: ${child.categoryId || 'None'}\n`;
      resultText += `   Business: ${child.businessId || 'None'}\n`;
      resultText += `   Note: ${child.note || 'None'}\n`;
      if (idx < children.length - 1) resultText += '\n';
    });
  } else {
    resultText += `Category: ${transaction.categoryId || 'None'}\n`;
    resultText += `Business: ${transaction.businessId || 'None'}\n`;
    resultText += `Note: ${transaction.note || 'None'}`;
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
