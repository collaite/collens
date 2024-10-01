import { ANTHROPIC_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();

  try {
    console.log('Initializing Claude API request...');
    const stream = await anthropic.completions.create({
      model: 'claude-2',
      prompt: `\n\nHuman: ${message}\n\nAssistant:`,
      max_tokens_to_sample: 300,
      stream: true,
    });

    console.log('Claude API request successful, creating readable stream...');
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const completion of stream) {
          const content = completion.completion;
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
    console.error('Error in Claude API:', error);
    return json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
};