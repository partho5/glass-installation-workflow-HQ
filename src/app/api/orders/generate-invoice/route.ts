import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pdf } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import React from 'react';
import { InvoicePDF } from '@/components/InvoicePDF';
import { uploadPDFToCloudinary } from '@/libs/CloudinaryService';
import {
  getClients,
  getCompletedOrdersByClient,
  getTruckModels,
  updateOrderToFacturado,
} from '@/libs/NotionService';

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
    const { clientId, startDate, endDate, orderIds } = body;

    // 3. VALIDATE
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 },
      );
    }

    // 4. FETCH COMPLETED ORDERS
    let orders = await getCompletedOrdersByClient(clientId, startDate, endDate);

    // If specific order IDs provided, filter to those only
    if (orderIds && orderIds.length > 0) {
      orders = orders.filter(o => orderIds.includes(o.id));
    }

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No completed orders found for this client' },
        { status: 404 },
      );
    }

    // 5. ENRICH WITH CLIENT/TRUCK DATA
    const [clients, truckModels] = await Promise.all([
      getClients(),
      getTruckModels(),
    ]);

    const clientMap = new Map(clients.map(c => [c.id, c]));
    const truckMap = new Map(truckModels.map(t => [t.id, t.model]));

    const client = clientMap.get(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const invoiceItems = orders.map(order => ({
      orderId: order.orderId,
      unitNumber: order.unitNumber,
      truckModel: truckMap.get(order.truckModelId) || 'Unknown',
      glassPosition: order.glassPosition,
      price: order.price,
    }));

    const total = orders.reduce((sum, o) => sum + o.price, 0);

    // 6. GENERATE INVOICE NUMBER
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const sequence = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    const invoiceNumber = `INV-${yearMonth}-${sequence}`;

    // 7. PREPARE INVOICE DATA
    const invoiceData = {
      invoiceNumber,
      invoiceDate: now.toLocaleDateString('es-MX'),
      clientName: client.name,
      clientAddress: '', // Add if available in client data
      clientPhone: '', // Add if available in client data
      items: invoiceItems,
      total,
    };

    // 8. GENERATE PDF
    const pdfElement = React.createElement(InvoicePDF, { data: invoiceData });
    const pdfDoc = pdf(pdfElement as any);
    const pdfBuffer = await pdfDoc.toBuffer() as any;

    // 9. UPLOAD TO CLOUDINARY
    const pdfUrl = await uploadPDFToCloudinary(
      pdfBuffer,
      clientId,
      `${invoiceNumber}.pdf`,
    );

    // 10. UPDATE ORDERS TO FACTURADO
    await Promise.all(
      orders.map(order =>
        updateOrderToFacturado(order.id, invoiceNumber, pdfUrl),
      ),
    );

    // 11. RETURN SUCCESS
    return NextResponse.json({
      success: true,
      invoiceNumber,
      pdfUrl,
      total,
      orderCount: orders.length,
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate invoice' },
      { status: 500 },
    );
  }
}
