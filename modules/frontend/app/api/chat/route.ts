import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    // Fallback for API key if env var is missing
    // User can replace 'YOUR_OPENROUTER_KEY_HERE' with their actual key if .env fails
    const apiKey = process.env.OPENROUTER_API_KEY || 'YOUR_OPENROUTER_KEY_HERE';

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', // Optional, for including your app on openrouter.ai rankings.
        'X-Title': 'Hackathon App', // Optional. Shows in rankings on openrouter.ai.
      },
    });

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free', 
      messages: [
        {
          role: 'system',
          content: 'You are SAM, a helpful assistant for employees. Keep answers concise, friendly, and easy to understand.',
        },
        ...messages,
      ],
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ role: 'assistant', content: reply });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
