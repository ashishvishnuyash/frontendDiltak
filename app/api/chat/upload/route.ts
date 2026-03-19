import { NextRequest, NextResponse } from 'next/server';

// File upload endpoint for chat
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const supportedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Process file based on type
    let processedContent = '';
    let fileType = 'document';

    if (file.type.startsWith('image/')) {
      // For images, convert to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      processedContent = `data:${file.type};base64,${base64}`;
      fileType = 'image';
    } else {
      // For text files, extract content
      if (file.type === 'text/plain') {
        processedContent = await file.text();
      } else {
        // For other document types, return metadata for now
        processedContent = `[${file.type}] ${file.name} - ${file.size} bytes`;
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        type: fileType,
        mimeType: file.type,
        size: file.size,
        content: processedContent
      }
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}