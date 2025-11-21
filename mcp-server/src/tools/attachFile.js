/**
 * Attach File Tool
 * Uploads and attaches a file (like an invoice) to a transaction
 */

import FormData from 'form-data';

export const attachFileTool = {
  name: 'attach_file',
  description: 'Upload and attach a file (such as an invoice, receipt, or document) to a transaction. The file should be provided as base64-encoded data.',
  inputSchema: {
    type: 'object',
    properties: {
      transactionId: {
        type: 'string',
        description: 'The ID of the transaction to attach the file to',
      },
      fileName: {
        type: 'string',
        description: 'The original filename (e.g., "invoice.pdf")',
      },
      fileData: {
        type: 'string',
        description: 'Base64-encoded file data',
      },
      mimeType: {
        type: 'string',
        description: 'MIME type of the file (e.g., "application/pdf", "image/jpeg"). Optional, will be inferred from filename if not provided.',
      },
    },
    required: ['transactionId', 'fileName', 'fileData'],
  },
};

export async function handleAttachFile(apiClient, args) {
  const { transactionId, fileName, fileData, mimeType } = args;

  // Decode base64 file data
  const buffer = Buffer.from(fileData, 'base64');

  // Create form data
  const form = new FormData();
  form.append('attachmentFile', buffer, {
    filename: fileName,
    contentType: mimeType || getMimeType(fileName),
  });

  // Upload file
  const response = await apiClient.post(
    `/api/transactions/${transactionId}/attachments`,
    form,
    {
      headers: {
        ...form.getHeaders(),
      },
    }
  );

  const { attachmentId, url } = response.data;

  return {
    content: [
      {
        type: 'text',
        text: `File "${fileName}" successfully attached to transaction ${transactionId}.\n\n` +
              `Attachment ID: ${attachmentId}\n` +
              `URL: ${url}`,
      },
    ],
  };
}

/**
 * Simple MIME type inference from file extension
 */
function getMimeType(fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  const mimeTypes = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
