import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { sql } from '$lib/db/db';

export const GET: RequestHandler = async ({ }) => {

  return json(await sql(`
      SELECT id, title, started_at
      FROM chats
      WHERE archived = false
      ORDER BY started_at DESC
    `));
};
