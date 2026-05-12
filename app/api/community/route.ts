import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';

/**
 * Community API — proxies to the custom backend.
 * Firebase has been removed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = token;

    const response = await axios.post(`${SERVER}/api/community`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const detail = error?.response?.data ?? { success: false, error: 'Failed to process community request' };
    return NextResponse.json(detail, { status });
  }
}
