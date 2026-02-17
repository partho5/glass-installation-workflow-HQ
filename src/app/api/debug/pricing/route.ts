import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { notion } from '@/libs/NotionClient';

const DB_IDS = {
  pricing: process.env.NOTION_PRICING_DB_ID!,
  clients: process.env.NOTION_CLIENTS_DB_ID!,
  truckModels: process.env.NOTION_TRUCK_MODELS_DB_ID!,
};

export async function GET(_req: NextRequest) {
  try {
    // 1. AUTHENTICATION
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    // 2. FETCH ALL PRICING ROWS
    const response = await notion.dataSources.query({
      data_source_id: DB_IDS.pricing,
      page_size: 100,
    });

    // 3. FETCH CLIENTS AND TRUCK MODELS FOR LOOKUP
    const [clientsRes, trucksRes] = await Promise.all([
      notion.dataSources.query({
        data_source_id: DB_IDS.clients,
        page_size: 100,
      }),
      notion.dataSources.query({
        data_source_id: DB_IDS.truckModels,
        page_size: 100,
      }),
    ]);

    const clientMap = new Map(
      clientsRes.results.map((c: any) => [
        c.id,
        c.properties.Name?.title?.[0]?.plain_text || 'Unknown',
      ]),
    );

    const truckMap = new Map(
      trucksRes.results.map((t: any) => [
        t.id,
        `${t.properties.Manufacturer?.rich_text?.[0]?.plain_text || ''} ${t.properties.Model?.title?.[0]?.plain_text || ''}`.trim(),
      ]),
    );

    // 4. FORMAT PRICING DATA
    const pricingData = response.results.map((row: any) => {
      const clientId = row.properties.Client?.relation?.[0]?.id;
      const truckId = row.properties['Truck Model']?.relation?.[0]?.id;

      return {
        id: row.id,
        client: clientMap.get(clientId) || clientId || 'NO CLIENT',
        clientId,
        truckModel: truckMap.get(truckId) || truckId || 'NO TRUCK',
        truckId,
        glassPosition: row.properties['Glass Position']?.select?.name || 'NO GLASS POSITION',
        price: row.properties.Price?.number || 0,
      };
    });

    // 5. GROUP BY CLIENT
    const grouped: Record<string, any[]> = {};
    pricingData.forEach((item) => {
      const key = item.client;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return NextResponse.json({
      success: true,
      total: pricingData.length,
      grouped,
      raw: pricingData,
    });
  } catch (error: any) {
    console.error('Error fetching pricing debug:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pricing data' },
      { status: 500 },
    );
  }
}
