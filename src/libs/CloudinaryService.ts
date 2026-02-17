/**
 * Cloudinary Service for uploading photos and signatures
 * Uses unsigned upload preset for direct browser uploads
 */
import crypto from 'node:crypto';
import axios from 'axios';
import NodeFormData from 'form-data';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

/**
 * Compress and resize image to max width while maintaining aspect ratio
 */
async function compressImage(file: File, maxWidth = 1920): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Set canvas size and draw image
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.85, // Quality (0-1)
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload photo or signature to Cloudinary
 * @param file - The file to upload
 * @param orderId - Order ID for organizing uploads
 * @param photoType - Type of photo (before_1, before_2, before_3, after, signature)
 * @returns Public URL of uploaded file
 */
export async function uploadToCloudinary(
  file: File | Blob,
  orderId: string,
  photoType: string,
): Promise<string> {
  try {
    // Compress image if it's a File (not already compressed)
    let fileToUpload: Blob;
    if (file instanceof File && file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file);
    } else {
      fileToUpload = file;
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', `glass-orders/${orderId}`);
    formData.append('context', `order_id=${orderId}|type=${photoType}`);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url; // Returns HTTPS URL
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

/**
 * Upload PDF invoice to Cloudinary (Server-side, signed upload)
 * Uses API key + secret to bypass "untrusted account" delivery restrictions.
 * @param pdfBuffer - The PDF buffer to upload
 * @param clientId - Client ID for organizing uploads
 * @param fileName - Name of the PDF file (e.g., INV-202602-0001.pdf)
 * @returns Public URL of uploaded PDF
 */

export async function uploadPDFToCloudinary(
  // eslint-disable-next-line node/prefer-global/buffer
  pdfBuffer: Buffer,
  clientId: string,
  fileName: string,
): Promise<string> {
  try {
    const folder = `glass-orders/${clientId}/invoices`;
    const timestamp = Math.round(Date.now() / 1000);

    // Build the signature: sort params alphabetically, join, append API secret
    // Do NOT include: file, api_key, resource_type, url
    const paramsToSign: Record<string, string | number> = { folder, timestamp };
    const signatureString
      = Object.entries(paramsToSign)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&') + API_SECRET;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const formData = new NodeFormData();
    formData.append('file', pdfBuffer, { filename: fileName, contentType: 'application/pdf' });
    formData.append('api_key', API_KEY);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('folder', folder);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );

    return response.data.secure_url;
  } catch (error: any) {
    console.error('Error uploading PDF to Cloudinary:', error.response?.data || error);
    throw new Error(
      error.response?.data?.error?.message
      || error.message
      || 'PDF upload failed',
    );
  }
}
