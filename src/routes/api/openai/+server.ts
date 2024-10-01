import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();

  if (!message) {
    return json({ error: 'No message provided' }, { status: 400 });
  }

  try {
    console.log('Initializing OpenAI API request...');
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    console.log('OpenAI API request successful, creating readable stream...');
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(content);
          }
        }
        controller.close();
      },
    });

    console.log('Readable stream created, sending response...');
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in OpenAI API:', error);
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error Status:', error.status);
      console.error('OpenAI API Error Message:', error.message);
      console.error('OpenAI API Error Code:', error.code);
      console.error('OpenAI API Error Type:', error.type);
    }
    return json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
};