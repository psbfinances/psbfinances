/**
 * Attach File Tool
 * Uploads and attaches a file (like an invoice) to a transaction
 */

import FormData from 'form-data';
import { readFileSync } from 'fs';

export const attachFileTool = {
  name: 'attach_file',
  description: 'Upload and attach a file (such as an invoice, receipt, or document) to a transaction. For files uploaded to Claude Desktop (in /mnt/user-data/uploads/), you MUST use fileData (base64) since those files are in Claude\'s sandbox. Only use filePath for files already on the host filesystem (e.g., user\'s Downloads folder).',
  inputSchema: {
    type: 'object',
    properties: {
      transactionId: {
        type: 'string',
        description: 'The ID of the transaction to attach the file to',
      },
      fileName: {
        type: 'string',
        description: 'The original filename (e.g., "invoice.pdf"). Optional if filePath is provided.',
      },
      filePath: {
        type: 'string',
        description: 'Absolute path to the file on disk (RECOMMENDED - much faster than base64). Use this if the file is saved locally or was uploaded to Claude.',
      },
      fileData: {
        type: 'string',
        description: 'Base64-encoded file data (alternative to filePath, slower for large files)',
      },
      mimeType: {
        type: 'string',
        description: 'MIME type of the file (e.g., "application/pdf", "image/jpeg"). Optional, will be inferred from filename if not provided.',
      },
    },
    required: ['transactionId'],
  },
};

export async function handleAttachFile(apiClient, args) {
  const { transactionId, fileName, filePath, fileData, mimeType } = args;

  let buffer;
  let finalFileName;

  if (filePath) {
    // Read file from disk (MUCH faster)
    buffer = readFileSync(filePath);
    finalFileName = fileName || filePath.split('/').pop();
  } else if (fileData) {
    // Decode base64 file data (slower)
    buffer = Buffer.from(fileData, 'base64');
    finalFileName = fileName || 'attachment';
  } else {
    throw new Error('Either filePath or fileData must be provided');
  }

  // Create form data
  const form = new FormData();
  form.append('attachmentFile', buffer, {
    filename: finalFileName,
    contentType: mimeType || getMimeType(finalFileName),
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
        text: `File "${finalFileName}" successfully attached to transaction ${transactionId}.\n\n` +
              `Attachment ID: ${attachmentId}\n` +
              `URL: ${url}`,
      },
    ],
  };
}

/**
 * Simple MIME type inference from file extension
 */
export function getMimeType(fileName) {
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
