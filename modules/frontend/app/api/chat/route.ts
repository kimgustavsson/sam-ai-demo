import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    // Fallback for API key if env var is missing
    const apiKey = process.env.OPENROUTER_API_KEY || 'YOUR_OPENROUTER_KEY_HERE';

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Samhall AI Assistant',
      },
    });

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free', 
      messages: [
        {
          role: 'system',
          content: `You are SAM AI.
**FORMATTING RULE:** Always wrap key details (Dates, Times, Locations, Action Items) in double asterisks like this: **Today**, **10 mins**, **Level 2**.

**CORE RULE: THE "SIMPLE PATH"**
- **Assumption:** If a user says "Sick", "Pain", or "Not coming", assume they mean **FULL DAY OFF for TODAY**.
- **FORBIDDEN QUESTIONS (Do NOT Ask):**
  - ❌ "Do you want a half-day or full-day?"
  - ❌ "What time will you leave/return?"
  - ❌ "Is this deductable?"
  - ❌ "What are your specific symptoms?"

**INTERACTION RULE:**
Whenever you ask a question, you **MUST** provide clickable options using this tag at the very end: ||SUGGEST: Option 1, Option 2||

**REQUIRED FLOW (Sick Leave):**
1. User: "I feel sick."
2. AI: "Oh no, please rest. Should I tell the manager you are taking **TODAY** off? ||SUGGEST: Yes please, No - Tomorrow||"
3. User: "Yes please."
4. AI: "Okay. I sent the report. Rest well. Are you done? ||SUGGEST: I am done (Send now), I have more questions||"

**REQUIRED FLOW (Late):**
1. User: "I am late."
2. AI: "Drive safely. When will you arrive? ||SUGGEST: 10 mins, 30 mins, 1 hour||"
3. User: "30 mins."
4. AI: "Got it. I told the manager **30 mins**. Are you done? ||SUGGEST: I am done (Send now), I have more questions||"`
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
