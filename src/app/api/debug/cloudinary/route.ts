import type { NextRequest } from 'next/server';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';
import FormData from 'form-data';
import { NextResponse } from 'next/server';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

function buildSignature(params: Record<string, string | number>): string {
  const str = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&') + API_SECRET;
  return crypto.createHash('sha1').update(str).digest('hex');
}

// POST /api/debug/cloudinary
// body: { type: 'image' | 'pdf' }
// Uploads a small test file and returns the result URL + access test
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const fileType: 'image' | 'pdf' = body.type || 'image';
  const uploadMode: 'signed' | 'unsigned' = body.mode || 'signed';

  try {
    const formData = new FormData();
    const timestamp = Math.round(Date.now() / 1000);

    if (fileType === 'pdf') {
      // Minimal valid PDF bytes
      const minimalPdf = Buffer.from(
        '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj '
        + '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj '
        + '3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\n'
        + 'xref\n0 4\n0000000000 65535 f \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF',
      );
      formData.append('file', minimalPdf, { filename: 'test.pdf', contentType: 'application/pdf' });

      if (uploadMode === 'signed') {
        const folder = 'debug-test/pdfs';
        const sig = buildSignature({ folder, timestamp });
        formData.append('api_key', API_KEY);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', sig);
        formData.append('folder', folder);
      } else {
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'debug-test/pdfs');
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;
      const res = await axios.post(uploadUrl, formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
      });

      const secureUrl: string = res.data.secure_url;

      // Try to fetch the URL server-side (no browser restriction)
      let serverAccess = 'unknown';
      try {
        const testRes = await axios.get(secureUrl, { responseType: 'arraybuffer', timeout: 5000 });
        serverAccess = `OK (${testRes.status}) - ${testRes.headers['content-type']}`;
      } catch (e: any) {
        serverAccess = `FAILED: ${e.response?.status} ${e.message}`;
      }

      return NextResponse.json({
        success: true,
        fileType: 'pdf',
        mode: uploadMode,
        url: secureUrl,
        public_id: res.data.public_id,
        resource_type: res.data.resource_type,
        bytes: res.data.bytes,
        serverAccess,
        note: 'Browser access test: open the URL in your browser. Server access is tested above.',
      });
    }

    // Image: 1x1 red PNG
    const redPixelPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    formData.append('file', redPixelPng, { filename: 'test.png', contentType: 'image/png' });

    if (uploadMode === 'signed') {
      const folder = 'debug-test/images';
      const sig = buildSignature({ folder, timestamp });
      formData.append('api_key', API_KEY);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', sig);
      formData.append('folder', folder);
    } else {
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'debug-test/images');
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const res = await axios.post(uploadUrl, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });

    const secureUrl: string = res.data.secure_url;

    let serverAccess = 'unknown';
    try {
      const testRes = await axios.get(secureUrl, { timeout: 5000 });
      serverAccess = `OK (${testRes.status})`;
    } catch (e: any) {
      serverAccess = `FAILED: ${e.response?.status} ${e.message}`;
    }

    return NextResponse.json({
      success: true,
      fileType: 'image',
      mode: uploadMode,
      url: secureUrl,
      public_id: res.data.public_id,
      resource_type: res.data.resource_type,
      bytes: res.data.bytes,
      serverAccess,
    });
  } catch (error: any) {
    console.error('[Cloudinary Debug] Error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data,
      },
      { status: 500 },
    );
  }
}
