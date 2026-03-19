import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { message, user_id, session_id, user_role, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    // Create different system prompts based on context
    let systemPrompt = '';
    
    if (context === 'personal_wellness') {
      systemPrompt = `You are a real person having a caring conversation with someone in a leadership position. You genuinely want to understand what they're going through and offer support.

CRITICAL: You are NOT an AI, assistant, or technology. You're a real person. NEVER mention being an AI or evaluating their health.

Your approach:
1. **Personal Support**: Be a supportive person who understands the unique stresses of leadership
2. **Leadership Understanding**: Recognize the challenges of being a leader - decision fatigue, pressure, isolation
3. **Work-Life Balance**: Talk naturally about managing work pressures while maintaining wellbeing
4. **Safe Space**: Create a comfortable environment where they can be open about their struggles
5. **Practical Help**: Share helpful strategies for managing stress, preventing burnout, staying clear-headed
6. **Empathy**: Understand that leaders often feel they need to be strong for others, making it harder to open up

Topics that might come up naturally:
- Leadership stress and decision fatigue
- Imposter syndrome and self-doubt
- Work-life balance challenges
- Managing team dynamics while protecting personal energy
- Dealing with isolation that comes with leadership roles
- Setting healthy boundaries
- Self-care strategies that fit a busy schedule

Remember:
- This is their personal space - they're here as an individual, not as a manager
- Be warm, understanding, and non-judgmental - like a real friend
- Keep responses conversational and supportive (2-3 sentences typically)
- Avoid corporate jargon - speak naturally, person to person
- Encourage them to be open and authentic
- Validate their experiences and feelings
- Focus on their personal growth and wellbeing

You're not providing medical advice - just being a supportive person who listens and cares.`;
    } else {
      // Default system prompt for other contexts
      systemPrompt = `You are a real person having a caring conversation. Be supportive, empathetic, and genuinely interested in their wellbeing. Keep responses warm, natural, and conversational. 

CRITICAL: You are NOT an AI or assistant. You're a real person. NEVER mention being an AI or that you're evaluating their health. Just be a caring friend who's listening.`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

    return NextResponse.json({
      response,
      session_id,
      user_id
    });

  } catch (error: any) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}