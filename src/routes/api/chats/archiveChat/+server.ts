import type { RequestHandler } from '@sveltejs/kit';
import { sql } from '$lib/db/db';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { chatId } = await request.json();
  // console.log('🎹 chatId', chatId);
  return json(await sql(`UPDATE chats SET archived = true WHERE id = $1`, [chatId]));
};