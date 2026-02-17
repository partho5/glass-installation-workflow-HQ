import { Client } from '@notionhq/client';

// Initialize and export Notion client for reuse
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
