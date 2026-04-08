/**
 * Proxy → Python backend POST /api/chat_wrapper
 * Returns { type: "message", data: {...} } | { type: "report", data: {...} } | { type: "assessment_questions", data: {...} }
 */
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.UMA_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const authHeader = request.headers.get('authorization') || '';

    let body: BodyInit;
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
      // Don't set Content-Type — fetch will set multipart boundary automatically
    } else {
      const json = await request.json();
      body = JSON.stringify(json);
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${BACKEND}/api/chat_wrapper`, {
      method: 'POST',
      headers,
      body,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('[chat_wrapper proxy]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
