import type { RequestHandler } from '@sveltejs/kit';
import { sql } from '$lib/db/db';
import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

/**
 *
 * @param param0 Get messages for a chat
 * @returns
 */
export const GET: RequestHandler = async ({ url }) => {
  const chatId = url.searchParams.get('chatId');
  console.log('Received GET request for chatId:', chatId);

  if (!chatId) {
    console.log('No chatId provided in the request');
    throw error(400, 'chatId is required');
  }

  try {
    console.log('Executing SQL query for chatId:', chatId);
    const result = await sql(`
      SELECT messages
      FROM chats
      WHERE id = $1
    `, [chatId]);
    console.log('SQL query result:', result);

    if (result.length === 0) {
      console.log('No chat found with id:', chatId);
      throw error(404, 'Chat not found');
    }

    const messages = result[0].messages;
    console.log('Retrieved messages:', messages);

    if (!Array.isArray(messages)) {
      console.log('Unexpected messages format:', messages);
      throw error(500, 'Unexpected data format');
    }

    console.log('Returning messages for chatId:', chatId);
    return json({ messages });
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    throw error(500, 'Internal Server Error');
  }
};

/**
 * Update the entire chat object
 * @param request
 * @returns
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { chat, chatId } = await request.json();
    console.log('Received POST request for chatId:', chatId);
    console.log('Received chat object:', chat);

    if (!chat || !Array.isArray(chat.messages)) {
      console.error('Invalid chat object received');
      return json({ error: 'Invalid chat object' }, { status: 400 });
    }

    const result = await sql(`
      UPDATE chats
      SET messages = $2::jsonb
      WHERE id = $1
      RETURNING messages;
    `, [chatId, JSON.stringify(chat.messages)]);
    console.log('SQL update result:', result);

    if (result.length === 0) {
      console.error('No chat found with id:', chatId);
      return json({ error: 'Chat not found' }, { status: 404 });
    }

    return json(result[0]);
  } catch (error) {
    console.error('Error processing chat update:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
