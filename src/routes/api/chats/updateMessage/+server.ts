// TODO WIP

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/db'; // Adjust this import based on your project structure

export const POST: RequestHandler = async ({ request }) => {
  const { chatId, messageId, content } = await request.json();

  console.log(`Updating message. ChatId: ${chatId}, MessageId: ${messageId}, Content: ${content}`);

  if (!chatId || !messageId || content === undefined) {
    console.error('Missing required parameters');
    return json({ success: false, message: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // Update the message in the database
    const result = await db.query(
      'UPDATE messages SET content = $1 WHERE chat_id = $2 AND id = $3 RETURNING *',
      [content, chatId, messageId]
    );

    if (result.rowCount === 0) {
      console.error('No message found with the given chatId and messageId');
      return json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    console.log('Message updated successfully:', result.rows[0]);
    return json({ success: true, message: 'Message updated successfully', updatedMessage: result.rows[0] });
  } catch (error) {
    console.error('Error updating message:', error);
    return json({ success: false, message: 'Failed to update message', error: error.message }, { status: 500 });
  }
};