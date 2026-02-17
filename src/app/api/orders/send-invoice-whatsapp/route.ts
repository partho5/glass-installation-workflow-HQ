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

    // 2. CHECK TWILIO CONFIGURATION
    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      console.error('Missing Twilio credentials:', {
        hasAccountSid: !!accountSid,
        hasAuthToken: !!authToken,
        hasWhatsAppNumber: !!twilioWhatsAppNumber,
      });
      return NextResponse.json(
        {
          error:
            'Twilio WhatsApp not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in .env',
        },
        { status: 500 },
      );
    }

    // 3. PARSE REQUEST
    const body = await req.json();
    const { clientPhone, invoiceNumber, pdfUrl, clientName } = body;

    // 4. VALIDATE
    if (!clientPhone || !pdfUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: clientPhone, pdfUrl' },
        { status: 400 },
      );
    }

    // 5. FORMAT PHONE NUMBER
    // Ensure format: whatsapp:+CountryCodeNumber (e.g., whatsapp:+5215551234567)
    const formattedPhone = clientPhone.startsWith('whatsapp:')
      ? clientPhone
      : `whatsapp:+${clientPhone.replace(/\D/g, '')}`;

    console.warn('[WhatsApp] Sending message:', {
      from: twilioWhatsAppNumber,
      to: formattedPhone,
      invoiceNumber,
    });

    // 6. SEND WHATSAPP MESSAGE
    // PDF sent as link in body (more reliable than mediaUrl which requires Twilio to download the file)
    const message = await client.messages.create({
      from: twilioWhatsAppNumber,
      to: formattedPhone,
      body: `Hola ${clientName || ''},\n\nAdjuntamos su factura #${invoiceNumber}.\n\n📄 Descargar PDF:\n${pdfUrl}\n\nGracias por su confianza.`,
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

    // Provide helpful error messages
    let errorMessage = error.message || 'Failed to send WhatsApp message';

    if (errorMessage.includes('Channel')) {
      errorMessage = `WhatsApp number not configured. Please use Twilio WhatsApp Sandbox number (e.g., whatsapp:+14155238886) or set up a WhatsApp Business number. Current: ${twilioWhatsAppNumber}`;
    } else if (errorMessage.includes('not a valid')) {
      errorMessage = `Invalid phone number format. Expected: whatsapp:+[country code][number]`;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
      },
      { status: 500 },
    );
  }
}
