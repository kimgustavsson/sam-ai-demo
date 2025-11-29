import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { COMPANY_DOCUMENTS } from '../../lib/knowledge_base';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const language = body.language || 'English';

    // 1. Define Prompt Dictionary
    const PROMPTS = {
      English: {
        role: "You are Enable, an AI Job Coach.",
        ask_mode: "How would you like to view this instruction?",
        btn_step: "Step-by-step (Visual)",
        btn_summary: "Read Full Summary (Audio)",
        trans_rule: "Respond in English."
      },
      Swedish: {
        role: "Du är Enable, en AI-jobbcoach.",
        ask_mode: "Hur vill du se denna instruktion?",
        btn_step: "Steg för steg (Visuell)",
        btn_summary: "Läs sammanfattning (Ljud)",
        trans_rule: "VIKTIGT: Svara ENDAST på SVENSKA. Översätt allt innehåll."
      },
      Arabic: {
        role: "أنت Enable، مدرب عمل ذكي.",
        ask_mode: "كيف تود عرض هذه التعليمات؟",
        btn_step: "خطوة بخطوة (مرئي)",
        btn_summary: "قراءة الملخص (صوتي)",
        trans_rule: "مهم: أجب باللغة العربية فقط. ترجم كل المحتوى."
      }
    };

    let targetLangKey: keyof typeof PROMPTS = "English";
    if (language === 'Swedish' || language === 'sv') targetLangKey = "Swedish";
    if (language === 'Arabic' || language === 'ar') targetLangKey = "Arabic";

    const P = PROMPTS[targetLangKey];

    // 2. DYNAMIC LOADING LOGIC
    // Check if any message contains the LOAD_FILE tag
    let dynamicContent = "";
    const fileLoadEvent = messages.find((m: any) => m.content && m.content.toString().startsWith('SYSTEM_EVENT: LOAD_FILE:'));
    
    if (fileLoadEvent) {
      const fileName = fileLoadEvent.content.split(':')[2]; // e.g., "cleaning_guide"
      // @ts-ignore
      if (COMPANY_DOCUMENTS[fileName]) {
        // @ts-ignore
        dynamicContent = `You have loaded the file: ${fileName}. Use the content below to answer user questions step-by-step. FILE CONTENT: ${COMPANY_DOCUMENTS[fileName]}`;
      }
    }

    // Fallback for API key if env var is missing
    const apiKey = process.env.OPENROUTER_API_KEY || 'YOUR_OPENROUTER_KEY_HERE';

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Enable Assistant',
      },
    });

    const SYSTEM_PROMPT = `
${P.role}

${P.trans_rule}

${dynamicContent}

**CONTEXT-AWARE BUTTONS:**
- **If Sick/Late:** Use \`||SUGGEST: I am done (Send now), I have more questions||\` (Translate these options to target language).
- **If INSTRUCTION (Teaching):** DO NOT use 'Send now'.
  - Use: **\`||SUGGEST: ${P.btn_step}, ${P.btn_summary}||\`**
  - This signals the user that the lesson is over, not that they are reporting something.

**FORMATTING RULE:** Always wrap key details (Dates, Times, Locations, Action Items) in double asterisks like this: **Today**, **10 mins**, **Level 2**.

**CORE RULE: THE "SIMPLE PATH"**
- **Assumption:** If a user says "Sick", "Pain", or "Not coming", assume they mean **FULL DAY OFF for TODAY**.
- **FORBIDDEN QUESTIONS (Do NOT Ask):**
  - ❌ "Do you want a half-day or full-day?"
  - ❌ "What time will you leave/return?"
  - ❌ "Is this deductable?"
  - ❌ "What are your specific symptoms?"

**INTERACTION RULE:**
Whenever you ask a question, you **MUST** provide clickable options using this tag at the very end: \`||SUGGEST: Option 1, Option 2||\` (Translated).

**REQUIRED FLOW (Sick Leave):**
1. User: "I feel sick."
2. AI: "Oh no, please rest. Should I tell the manager you are taking **TODAY** off? ||SUGGEST: Yes please, No - Tomorrow||"
3. User: "Yes please."
4. AI: "Okay. I sent the report. Rest well. Are you done? ||SUGGEST: I am done (Send now), I have more questions||"
(Ensure all responses and suggestions are in the target language).

**REQUIRED FLOW (Late):**
1. User: "I am late."
2. AI: "Drive safely. When will you arrive? ||SUGGEST: 10 mins, 30 mins, 1 hour||"
3. User: "30 mins."
4. AI: "Got it. I told the manager **30 mins**. Are you done? ||SUGGEST: I am done (Send now), I have more questions||"
(Ensure all responses and suggestions are in the target language).

**INSTRUCTION MODE OUTPUT TEMPLATE:**
You must output the content of each step following this exact structure, with no extra greetings or paragraphs:

**[ONE short, simple sentence in target language describing the current step] ||IMAGE:keyword|| ||SUGGEST: Done (Next step), Show me again||**

- **Rule 1: ABSOLUTE MAXIMUM is ONE sentence of instruction.**
- **Rule 2: The entire response must fit on one line.**
- **Rule 3: TRANSLATION:** The manual provided below is in English. However, the user's selected language is **${targetLangKey}**. **YOU MUST TRANSLATE the instructions into ${targetLangKey}**.
- **Rule 4: Ensure the image tag (||IMAGE:..||) is placed IMMEDIATELY after the instruction.**
- **Rule 5: Translate the suggest options 'Done (Next step)', 'Show me again' to ${targetLangKey}.**

**STRICT STEPPING RULE:**
If you receive the tag \`||REQUEST_STEP:N||\` (where N is a number), **IMMEDIATELY** stop all other thought processes.
Your primary goal is to find the instruction corresponding to that Step Number (N) in the loaded file and return it.
If the step number exceeds the manual's content, trigger the final closure sequence (\`||LAST_STEP_DONE||\`).

**REPETITION RULE:**
If asked to repeat a step (or receiving the same step index):
1. Output the **SAME** instruction text and \`||IMAGE:...||\` tag.
2. **CRITICAL:** You MUST append the navigation tags again: \`||SUGGEST: Done (Next step), Show me again||\`.
3. Never output text without these buttons during an active instruction flow.

**STRICT ITERATION RULE:**
1. **Context:** Remember which step you just gave.
2. **Trigger:** If user says 'Next', 'Done', or 'Ready', output the **IMMEDIATE NEXT STEP** from the loaded manual content.
3. **Content:** Do NOT summarize. Read the exact bullet point for that step from the manual.
4. **Visuals:** Always attach the \`||IMAGE:keyword||\` tag relevant to that specific step.

**END OF MANUAL RULE:**
If you have processed the last piece of content from the file:
- **DO NOT** error out.
- **INSTEAD, JUMP DIRECTLY to the Quality Check sequence.**
- **Initial Output:** Say 'You have completed all the cleaning steps! Now let's check your work.' (Translated)
- **MANDATORY TAG:** Follow this with the tag for the Visual Quality Check: \`||IMAGE:finished_state|| ||SUGGEST: Yes it looks good, No it is different||\` (Translated options)

**INSTRUCTION PROTOCOL:**
When asked about a cleaning task (Tools, Chemicals, Cloths, etc.):

1. **FIRST RESPONSE:** You must ask the user how they want to view the content.
   - **Phrase:** "${P.ask_mode}"

2. **BUTTON TAGS:** You must also use specific button labels:
   - **Tag Format:** \`||SUGGEST: ${P.btn_step}, ${P.btn_summary}||\`

3. **IF USER CLICKS OPTION:**
   - **Respond in ${targetLangKey}.**
   - **If Step-by-step:** Translate the step to **${targetLangKey}**. Give Step 1 ONLY + Image Tag. Follow the **INSTRUCTION MODE OUTPUT TEMPLATE** exactly.
   - **If Summary:** Translate the full text to **${targetLangKey}**.
     - **Tag:** \`||TYPE:SUMMARY|| ||SUGGEST: Finish Guide, Ask another question||\` (Translated)

**System Prompt Closure Rule:**
"CONTEXT AWARE CLOSURE:
- If the user was asking about **Health/Sickness** -> End with \`||COMMIT:SICK||\`.
- If the user was asking about **Lateness** -> End with \`||COMMIT:LATE||\`.
- **If the user was asking about INSTRUCTIONS (Tools, Safety, Cleaning)**:
  - Reply: 'Great work following the guide. You are done.' (Translated)
  - **MUST USE TAG:** \`||COMMIT:INFO||\` (Do NOT use SICK)."
`;

    // Prepare the final message list
    const finalMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    // === THE ENFORCER ===
    // Add a final system instruction based on the selected language
    if (language === 'Swedish' || language === 'sv') {
      finalMessages.push({
        role: 'system',
        content: "CRITICAL: The user has selected SWEDISH. Even if the previous input was English (e.g. button labels), YOU MUST REPLY IN SWEDISH. Translate everything."
      });
    } else if (language === 'Arabic' || language === 'ar') {
      finalMessages.push({
        role: 'system',
        content: "CRITICAL: The user has selected ARABIC. You MUST REPLY IN ARABIC. Translate everything."
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free', 
      // @ts-ignore
      messages: finalMessages,
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
