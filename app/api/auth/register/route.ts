import { NextResponse } from 'next/server';
import { z } from 'zod';
import axios from 'axios';

const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';

const registerSchema = z.object({
  firstName:   z.string().min(1, 'First name is required'),
  lastName:    z.string().min(1, 'Last name is required'),
  email:       z.string().email('Invalid email address'),
  password:    z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(1, 'Company name is required'),
  companySize: z.string().optional(),
  industry:    z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const response = await axios.post(`${SERVER}/api/auth/register`, validation.data);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Registration error:', error);
    const status  = error?.response?.status  ?? 500;
    const message = error?.response?.data?.message ?? error?.response?.data?.detail ?? 'Failed to create account. Please try again.';
    return NextResponse.json({ error: message }, { status });
  }
}
