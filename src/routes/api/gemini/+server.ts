import { GEMINI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();

  try {
    console.log('Initializing Gemini API request...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContentStream(message);

    console.log('Gemini API request successful, creating readable stream...');
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            controller.enqueue(chunkText);
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
    console.error('Error in Gemini API:', error);
    return json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
};