import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SERVER = process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role, department, position, company_id, managerId, hierarchyLevel, permissions = {} } = body;

    if (!email || !password || !firstName || !lastName || !role || !company_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const token = request.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = token;

    const response = await axios.post(`${SERVER}/api/employees/create`, {
      email, password, firstName, lastName, role,
      department: department || '',
      position: position || '',
      company_id,
      managerId: managerId && managerId !== 'none' ? managerId : null,
      hierarchyLevel: parseInt(hierarchyLevel) || 4,
      permissions,
    }, { headers });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const detail = error?.response?.data ?? { error: error.message };
    return NextResponse.json(detail, { status });
  }
}
