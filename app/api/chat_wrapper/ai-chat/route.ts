/**
 * Proxy → Python backend POST /api/chat_wrapper/ai-chat
 * Deep conversation mode — GPT-4, no-AI-identity persona.
 * Input:  { message, user_id?, session_id?, context? }
 * Output: { response, session_id, user_id }
 */
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.UMA_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const res = await fetch(`${BACKEND}/api/chat_wrapper/ai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('[chat_wrapper/ai-chat proxy]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
