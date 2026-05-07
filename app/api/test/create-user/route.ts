import { NextResponse } from 'next/server';
import axios from 'axios';

const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role = 'employee' } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const response = await axios.post(`${SERVER}/api/test/create-user`, { email, password, role });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const detail = error?.response?.data ?? { error: 'Failed to create test user' };
    return NextResponse.json(detail, { status });
  }
}
