import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER!;

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    // 1. AUTHENTICATION
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    // 2. PARSE REQUEST
    const body = await req.json();
    const { clientPhone, invoiceNumber, pdfUrl, clientName } = body;

    // 3. VALIDATE
    if (!clientPhone || !pdfUrl || !invoiceNumber) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: clientPhone, pdfUrl, invoiceNumber',
        },
        { status: 400 },
      );
    }

    // 4. FORMAT PHONE NUMBER
    // Ensure format: whatsapp:+CountryCodeNumber (e.g., whatsapp:+5215551234567)
    const formattedPhone = clientPhone.startsWith('whatsapp:')
      ? clientPhone
      : `whatsapp:+${clientPhone.replace(/\D/g, '')}`;

    // 5. SEND WHATSAPP MESSAGE
    const message = await client.messages.create({
      from: twilioWhatsAppNumber,
      to: formattedPhone,
      body: `Hola ${clientName || ''},\n\nAdjuntamos su factura #${invoiceNumber}.\n\nGracias por su confianza.`,
      mediaUrl: [pdfUrl],
    });

    // 6. RETURN SUCCESS
    return NextResponse.json({
      success: true,
      messageId: message.sid,
      status: message.status,
      sentTo: formattedPhone,
    });
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send WhatsApp message' },
      { status: 500 },
    );
  }
}
