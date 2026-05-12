import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';

/**
 * Gamification API — proxies to the custom backend.
 * Firebase has been removed; all data lives in the backend database.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, employee_id, company_id, data } = body;

    if (!employee_id || !company_id) {
      return NextResponse.json({ success: false, error: 'Employee ID and Company ID are required' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = token;

    const response = await axios.post(
      `${SERVER}/api/gamification`,
      { action, employee_id, company_id, data },
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const detail = error?.response?.data ?? { success: false, error: 'Failed to process gamification request' };
    return NextResponse.json(detail, { status });
  }
}
