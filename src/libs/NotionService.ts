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

    const response = await notion.pages.create({
      parent: { data_source_id: DB_IDS.orders },
      properties: {
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
        ...(data.notes && {
          Notes: {
            rich_text: [
              {
                text: {
                  content: data.notes,
                },
              },
            ],
          },
        }),
      },
    });

    return {
      success: true,
      orderId,
      notionPageId: response.id,
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
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
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
