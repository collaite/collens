import type { RequestHandler } from '@sveltejs/kit';
import { sql } from '$lib/db/db';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { title, user_id } = await request.json();
  return json(
    await sql(
      `INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING id`
      , [user_id, title])
  )
};