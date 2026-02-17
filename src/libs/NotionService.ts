import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Database IDs from environment variables
const DB_IDS = {
  orders: process.env.NOTION_ORDERS_DB_ID!,
  clients: process.env.NOTION_CLIENTS_DB_ID!,
  truckModels: process.env.NOTION_TRUCK_MODELS_DB_ID!,
  glassParts: process.env.NOTION_GLASS_PARTS_DB_ID!,
  inventory: process.env.NOTION_INVENTORY_DB_ID!,
  crews: process.env.NOTION_CREWS_DB_ID!,
  pricing: process.env.NOTION_PRICING_DB_ID!,
};

/**
 * Fetch all clients from Notion
 * Returns: Array of { id, name }
 */
export async function getClients() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: DB_IDS.clients,
    });

    return response.results.map((page: any) => ({
      id: page.id,
      name: page.properties['Company Name']?.title?.[0]?.plain_text || 'Unnamed',
      phone: page.properties.Phone?.phone_number || page.properties.Phone?.rich_text?.[0]?.plain_text || '',
      address: page.properties.Address?.rich_text?.[0]?.plain_text || '',
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

/**
 * Fetch all truck models from Notion
 * Returns: Array of { id, model, manufacturer }
 */
export async function getTruckModels() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: DB_IDS.truckModels,
    });

    return response.results.map((page: any) => ({
      id: page.id,
      model: page.properties['Model Name']?.title?.[0]?.plain_text || 'Unnamed',
      manufacturer: page.properties.Manufacturer?.select?.name || '',
    }));
  } catch (error) {
    console.error('Error fetching truck models:', error);
    throw error;
  }
}

/**
 * Get glass positions (hardcoded as per spec)
 * Returns: Array of position strings
 */
export function getGlassPositions() {
  return [
    'Parabrisas',
    'Lateral Izq',
    'Lateral Der',
    'Trasero',
  ];
}

/**
 * Lookup price from Pricing table
 * Based on: Client + Truck Model + Glass Position
 * Returns: Price amount or null if not found
 */
export async function getPricingForOrder(
  clientId: string,
  truckModelId: string,
  glassPosition: string,
): Promise<number | null> {
  try {
    console.warn('[Pricing Lookup] Searching for:', {
      clientId,
      truckModelId,
      glassPosition,
    });

    const response = await notion.dataSources.query({
      data_source_id: DB_IDS.pricing,
      filter: {
        and: [
          {
            property: 'Client',
            relation: { contains: clientId },
          },
          {
            property: 'Truck Model',
            relation: { contains: truckModelId },
          },
          {
            property: 'Glass Position',
            select: { equals: glassPosition },
          },
        ],
      },
    });

    console.warn('[Pricing Lookup] Results found:', response.results.length);

    // If matching price found, return it
    if (response.results.length > 0) {
      const pricingPage: any = response.results[0];
      const price = pricingPage.properties.Price?.number || null;
      console.warn('[Pricing Lookup] Price found:', price);
      return price;
    }

    // No matching price found
    return null;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return null;
  }
}

/**
 * Generate next Order ID
 * Format: ORD-2024-0001
 */
export async function generateOrderId() {
  try {
    // Query all orders without sorting (sorting can fail if property doesn't exist)
    const response = await notion.dataSources.query({
      data_source_id: DB_IDS.orders,
      page_size: 100, // Get recent orders
    });

    // If no orders exist, start with 0001
    if (response.results.length === 0) {
      const year = new Date().getFullYear();
      return `ORD-${year}-0001`;
    }

    // Extract all order IDs and find the highest number
    const orderIds = response.results
      .map((page: any) => page.properties['Order ID']?.title?.[0]?.plain_text || '')
      .filter((id: string) => id.startsWith('ORD-'));

    if (orderIds.length === 0) {
      const year = new Date().getFullYear();
      return `ORD-${year}-0001`;
    }

    // Parse all order IDs and find the max
    let maxNum = 0;
    const currentYear = new Date().getFullYear();

    orderIds.forEach((orderId: string) => {
      const match = orderId.match(/ORD-(\d{4})-(\d{4})/);
      if (match && match[1] && match[2]) {
        const year = Number.parseInt(match[1], 10);
        const num = Number.parseInt(match[2], 10);

        // Only consider orders from current year
        if (year === currentYear && num > maxNum) {
          maxNum = num;
        }
      }
    });

    // Increment number
    const nextNum = (maxNum + 1).toString().padStart(4, '0');
    return `ORD-${currentYear}-${nextNum}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    const year = new Date().getFullYear();
    return `ORD-${year}-0001`;
  }
}

/**
 * Create new order in Notion
 */
export async function createOrder(data: {
  clientId: string;
  unitNumber: string;
  truckModelId: string;
  glassPosition: string;
  notes?: string;
}) {
  try {
    const orderId = await generateOrderId();

    // Lookup price from Pricing table
    const price = await getPricingForOrder(
      data.clientId,
      data.truckModelId,
      data.glassPosition,
    );

    const properties: any = {
      'Order ID': {
        title: [
          {
            text: {
              content: orderId,
            },
          },
        ],
      },
      'Client': {
        relation: [{ id: data.clientId }],
      },
      'Unit Number': {
        rich_text: [
          {
            text: {
              content: data.unitNumber,
            },
          },
        ],
      },
      'Truck Model': {
        relation: [{ id: data.truckModelId }],
      },
      'Glass Position': {
        select: {
          name: data.glassPosition,
        },
      },
      'Status': {
        select: {
          name: 'Pendiente',
        },
      },
    };

    // Add price if found
    if (price !== null) {
      properties.Price = {
        number: price,
      };
    }

    // Add notes if provided
    if (data.notes) {
      properties.Notes = {
        rich_text: [
          {
            text: {
              content: data.notes,
            },
          },
        ],
      };
    }

    const response = await notion.pages.create({
      parent: { data_source_id: DB_IDS.orders },
      properties,
    });

    return {
      success: true,
      orderId,
      notionPageId: response.id,
      price, // Return price so UI can show it
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Fetch all orders (for dashboard)
 */
export async function getOrders(filters?: {
  status?: string;
  clientId?: string;
}) {
  try {
    const queryParams: any = {
      data_source_id: DB_IDS.orders,
    };

    // Add filters if provided
    if (filters?.status) {
      queryParams.filter = {
        property: 'Status',
        select: {
          equals: filters.status,
        },
      };
    }

    const response = await notion.dataSources.query(queryParams);

    return response.results.map((page: any) => ({
      id: page.id,
      orderId: page.properties['Order ID']?.title?.[0]?.plain_text || '',
      client: page.properties.Client?.relation?.[0]?.id || '',
      unitNumber: page.properties['Unit Number']?.rich_text?.[0]?.plain_text || '',
      truckModel: page.properties['Truck Model']?.relation?.[0]?.id || '',
      glassPosition: page.properties['Glass Position']?.select?.name || '',
      status: page.properties.Status?.select?.name || 'Pendiente',
      notes: page.properties.Notes?.rich_text?.[0]?.plain_text || '',
      createdAt: page.created_time, // Use built-in created_time
      assignedCrew: page.properties['Assigned Crew']?.relation?.[0]?.id || null,
      scheduledDate: page.properties['Scheduled Date']?.date?.start || null,
      invoiceNumber: page.properties['Invoice Number']?.rich_text?.[0]?.plain_text || null,
      invoicePdfUrl: page.properties['Invoice PDF URL']?.url || null,
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Fetch orders assigned to a specific crew (for crew dashboard)
 * Returns only orders with Status = "Programado"
 */
export async function getCrewJobs(crewId: string) {
  try {
    const response = await notion.dataSources.query({
      data_source_id: DB_IDS.orders,
      filter: {
        and: [
          {
            property: 'Assigned Crew',
            relation: {
              contains: crewId,
            },
          },
          {
            property: 'Status',
            select: {
              equals: 'Programado',
            },
          },
        ],
      },
    });

    return response.results.map((page: any) => ({
      id: page.id,
      orderId: page.properties['Order ID']?.title?.[0]?.plain_text || '',
      client: page.properties.Client?.relation?.[0]?.id || '',
      unitNumber: page.properties['Unit Number']?.rich_text?.[0]?.plain_text || '',
      truckModel: page.properties['Truck Model']?.relation?.[0]?.id || '',
      glassPosition: page.properties['Glass Position']?.select?.name || '',
      status: page.properties.Status?.select?.name || 'Programado',
      notes: page.properties.Notes?.rich_text?.[0]?.plain_text || '',
      scheduleDate: page.properties['Schedule Date']?.date?.start || '',
      createdAt: page.created_time,
    }));
  } catch (error) {
    console.error('Error fetching crew jobs:', error);
    throw error;
  }
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(pageId: string) {
  try {
    const page: any = await notion.pages.retrieve({ page_id: pageId });

    // Parse job progress if it exists
    let jobProgress = null;
    const progressText = page.properties['Job Progress']?.rich_text?.[0]?.plain_text;
    if (progressText) {
      try {
        jobProgress = JSON.parse(progressText);
      } catch {
        jobProgress = null;
      }
    }

    return {
      id: page.id,
      orderId: page.properties['Order ID']?.title?.[0]?.plain_text || '',
      client: page.properties.Client?.relation?.[0]?.id || '',
      unitNumber: page.properties['Unit Number']?.rich_text?.[0]?.plain_text || '',
      truckModel: page.properties['Truck Model']?.relation?.[0]?.id || '',
      glassPosition: page.properties['Glass Position']?.select?.name || '',
      status: page.properties.Status?.select?.name || 'Pendiente',
      notes: page.properties.Notes?.rich_text?.[0]?.plain_text || '',
      createdAt: page.created_time,
      jobProgress,
    };
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
}

/**
 * Update order status in Notion
 */
export async function updateOrderStatus(
  pageId: string,
  newStatus: string,
  note?: string,
) {
  try {
    const updateData: any = {
      properties: {
        Status: {
          select: {
            name: newStatus,
          },
        },
      },
    };

    // If note provided, update inventory note field
    if (note) {
      updateData.properties['Inventory Note'] = {
        rich_text: [
          {
            text: {
              content: note,
            },
          },
        ],
      };
    }

    const response = await notion.pages.update({
      page_id: pageId,
      ...updateData,
    });

    return {
      success: true,
      pageId: response.id,
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Fetch all crews from Notion
 * Returns: Array of { id, name, leadInstaller, phone, status }
 */
export async function getCrews() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: DB_IDS.crews,
    });

    return response.results.map((page: any) => ({
      id: page.id,
      name: page.properties['Crew Name']?.title?.[0]?.plain_text || 'Unnamed',
      leadInstaller: page.properties['Lead Installer']?.rich_text?.[0]?.plain_text || '',
      phone: page.properties.Phone?.phone_number || '',
      status: page.properties.Status?.select?.name || 'Available',
    }));
  } catch (error) {
    console.error('Error fetching crews:', error);
    throw error;
  }
}

/**
 * Update order with crew assignment and schedule
 */
export async function scheduleOrder(
  pageId: string,
  crewId: string,
  scheduleDate: string,
) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        'Assigned Crew': {
          relation: [{ id: crewId }],
        },
        'Schedule Date': {
          date: {
            start: scheduleDate,
          },
        },
        'Status': {
          select: {
            name: 'Programado',
          },
        },
      },
    });

    return {
      success: true,
      pageId: response.id,
    };
  } catch (error) {
    console.error('Error scheduling order:', error);
    throw error;
  }
}

/**
 * Complete a job with photos, signature, and GPS
 */
export async function completeJob(data: {
  pageId: string;
  beforePhotos: string[]; // Array of 3 Cloudinary URLs
  afterPhotos: string[]; // Array of 1 Cloudinary URL
  signatureUrl: string; // Cloudinary URL
  customerName: string;
  gpsLocation: { lat: number; lng: number };
  userId: string; // Clerk user ID
}) {
  try {
    const response = await notion.pages.update({
      page_id: data.pageId,
      properties: {
        'Before Photos': {
          files: data.beforePhotos.map((url, index) => ({
            type: 'external',
            name: `before_${index + 1}.jpg`,
            external: { url },
          })),
        },
        'After Photos': {
          files: data.afterPhotos.map((url, index) => ({
            type: 'external',
            name: `after_${index + 1}.jpg`,
            external: { url },
          })),
        },
        'Customer Signature': {
          files: [
            {
              type: 'external',
              name: 'signature.png',
              external: { url: data.signatureUrl },
            },
          ],
        },
        'GPS Location': {
          rich_text: [
            {
              text: {
                content: `${data.gpsLocation.lat},${data.gpsLocation.lng}`,
              },
            },
          ],
        },
        'Completion Time': {
          date: {
            start: new Date().toISOString(),
          },
        },
        'Completed By': {
          rich_text: [
            {
              text: {
                content: data.userId,
              },
            },
          ],
        },
        'Customer Name': {
          rich_text: [
            {
              text: {
                content: data.customerName,
              },
            },
          ],
        },
        'Status': {
          select: {
            name: 'Completado',
          },
        },
        'Job Progress': {
          rich_text: [], // Clear progress when job is completed
        },
      },
    });

    return {
      success: true,
      pageId: response.id,
    };
  } catch (error) {
    console.error('Error completing job:', error);
    throw error;
  }
}

/**
 * Save job execution progress to Notion
 * Allows crews to resume work after closing the app
 */
export async function saveJobProgress(
  pageId: string,
  progress: {
    currentStep: number;
    beforePhotos: string[];
    afterPhotos: string[];
    signatureUrl: string;
    customerName: string;
    gpsLocation: { lat: number; lng: number };
  },
) {
  try {
    const progressData = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    };

    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Job Progress': {
          rich_text: [
            {
              text: {
                content: JSON.stringify(progressData),
              },
            },
          ],
        },
      },
    });

    return {
      success: true,
      pageId,
    };
  } catch (error) {
    console.error('Error saving job progress:', error);
    throw error;
  }
}

/**
 * Fetch completed orders by client (for billing)
 * Returns orders with Status = "Completado", optionally filtered by client and date range
 */
export async function getCompletedOrdersByClient(
  clientId?: string,
  startDate?: string,
  endDate?: string,
) {
  try {
    const filters: any[] = [];

    // Always filter Status = Completado
    filters.push({
      property: 'Status',
      select: { equals: 'Completado' },
    });

    // Optional: Client filter
    if (clientId) {
      filters.push({
        property: 'Client',
        relation: { contains: clientId },
      });
    }

    // Optional: Date range filter on Completion Time
    if (startDate && endDate) {
      filters.push({
        property: 'Completion Time',
        date: {
          on_or_after: startDate,
          on_or_before: endDate,
        },
      });
    }

    const queryParams: any = {
      data_source_id: DB_IDS.orders,
    };

    // Apply filters
    if (filters.length === 1) {
      queryParams.filter = filters[0];
    } else if (filters.length > 1) {
      queryParams.filter = { and: filters };
    }

    const response = await notion.dataSources.query(queryParams);

    return response.results.map((page: any) => ({
      id: page.id,
      orderId: page.properties['Order ID']?.title?.[0]?.plain_text || '',
      clientId: page.properties.Client?.relation?.[0]?.id || '',
      unitNumber: page.properties['Unit Number']?.rich_text?.[0]?.plain_text || '',
      truckModelId: page.properties['Truck Model']?.relation?.[0]?.id || '',
      glassPosition: page.properties['Glass Position']?.select?.name || '',
      price: page.properties.Price?.number || 0,
      completedAt: page.properties['Completion Time']?.date?.start || '',
      status: page.properties.Status?.select?.name || '',
    }));
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    throw error;
  }
}

/**
 * Update order to "Facturado" status with invoice details
 */
export async function updateOrderToFacturado(
  pageId: string,
  invoiceNumber: string,
  pdfUrl: string,
) {
  try {
    const now = new Date();
    const invoiceDate = now.toISOString().split('T')[0] ?? now.toISOString().substring(0, 10); // YYYY-MM-DD format

    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        'Status': {
          select: { name: 'Facturado' },
        },
        'Invoice Number': {
          rich_text: [{ text: { content: invoiceNumber } }],
        },
        'Invoice Date': {
          date: { start: invoiceDate },
        },
        'Invoice PDF URL': {
          url: pdfUrl,
        },
        'Invoice Sent Date': {
          date: { start: now.toISOString() },
        },
      },
    });

    return {
      success: true,
      pageId: response.id,
    };
  } catch (error) {
    console.error('Error updating order to Facturado:', error);
    throw error;
  }
}
