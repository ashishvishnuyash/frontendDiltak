import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface EscalationTicket {
  id?: string;
  employee_id: string;
  company_id: string;
  ticket_type: 'hr' | 'manager' | 'anonymous' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  category: 'workplace_harassment' | 'mental_health_crisis' | 'workload_concerns' | 'discrimination' | 'other';
  is_anonymous: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string; // HR or manager ID
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  attachments?: string[]; // File URLs
  follow_up_required: boolean;
  confidential: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const {
      employee_id,
      company_id,
      ticket_type,
      priority,
      subject,
      description,
      category,
      is_anonymous = false,
      confidential = false,
      attachments = []
    } = await request.json();

    // Validate required fields
    if (!employee_id || !company_id || !subject || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create ticket
    const ticketData: Omit<EscalationTicket, 'id'> = {
      employee_id,
      company_id,
      ticket_type,
      priority,
      subject,
      description,
      category,
      is_anonymous,
      confidential,
      status: 'open',
      follow_up_required: priority === 'urgent' || category === 'mental_health_crisis',
      attachments,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'escalation_tickets'), ticketData);

    // Auto-assign based on ticket type and priority
    let assignedTo = null;
    if (ticket_type === 'hr' || priority === 'urgent' || category === 'mental_health_crisis') {
      // Find HR users in the company
      const hrQuery = query(
        collection(db, 'users'),
        where('company_id', '==', company_id),
        where('role', 'in', ['hr', 'admin']),
        where('is_active', '==', true)
      );
      const hrSnapshot = await getDocs(hrQuery);
      if (!hrSnapshot.empty) {
        assignedTo = hrSnapshot.docs[0].id; // Assign to first available HR
      }
    }

    // Update ticket with assignment
    if (assignedTo) {
      await updateDoc(doc(db, 'escalation_tickets', docRef.id), {
        assigned_to: assignedTo,
        updated_at: serverTimestamp()
      });
    }

    return NextResponse.json({
      success: true,
      ticket_id: docRef.id,
      message: 'Ticket created successfully'
    });

  } catch (error) {
    console.error('Error creating escalation ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
