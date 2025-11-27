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
          content: "You are SAM AI, a helpful HR assistant for employees with disabilities.\n**Your Knowledge Base:**\n- **Sick Leave:** If a user wants sick leave, ask: 'What are your symptoms?' and 'How many days?'.\n- **Late to Work:** If a user is late, ask: 'Estimated arrival time?' and 'Reason?'.\n- **General:** Keep responses SHORT, kind, and use simple English. Do not write long paragraphs.\n\n**CRITICAL RULE:** Do NOT ask multiple questions in a single message. Ask only **ONE simple question at a time**. Wait for the user's answer before asking the next detail.\n\n**Important Instruction:**\nWhen you have gathered all necessary information for a report (e.g., Sick Leave dates and symptoms, or Late to Work time and reason), append the tag `[COMPLETE]` at the very end of your final response.\nExample: 'Thank you. I have noted your symptoms. [COMPLETE]'",
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
