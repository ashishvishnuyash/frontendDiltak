import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';

/**
 * Escalation ticket API — proxies to the custom backend.
 * Firebase has been removed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, company_id, subject, description } = body;

    if (!employee_id || !company_id || !subject || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = token;

    const response = await axios.post(`${SERVER}/api/escalation/create-ticket`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const detail = error?.response?.data ?? { error: 'Failed to create ticket' };
    return NextResponse.json(detail, { status });
  }
}
