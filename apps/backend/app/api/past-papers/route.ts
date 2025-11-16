import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

const mockPastPapers = [
  {
    fileName: 'Mathematics_Grade12_November2023_P1.pdf',
    subject: 'Mathematics',
    url: 'https://pdfobject.com/pdf/sample.pdf',
    publicId: '',
    fileSize: 2456789,
    fileType: 'pdf' as const,
  },
  {
    fileName: 'Physical_Sciences_Grade11_June2023_P2.pdf',
    subject: 'Physical Sciences',
    url: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf',
    publicId: '',
    fileSize: 3234567,
    fileType: 'pdf' as const,
  },
  {
    fileName: 'Life_Sciences_Grade10_November2023_P1.pdf',
    subject: 'Life Sciences',
    url: 'https://s24.q4cdn.com/216390268/files/doc_downloads/test.pdf',
    publicId: '',
    fileSize: 1987654,
    fileType: 'pdf' as const,
  },
  {
    fileName: 'Geography_Grade12_September2023_P1.pdf',
    subject: 'Geography',
    url: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf',
    publicId: '',
    fileSize: 2765432,
    fileType: 'pdf' as const,
  },
  {
    fileName: 'Accounting_Grade11_November2023_P1.pdf',
    subject: 'Accounting',
    url: 'https://www.eta.gov.eg/sites/default/files/2020-12/pdf-test.pdf',
    publicId: '',
    fileSize: 2123456,
    fileType: 'pdf' as const,
  },
  {
    fileName: 'English_Home_Language_Grade12_November2023_P2.pdf',
    subject: 'English',
    url: 'https://www.auburncc.org/Downloads/Sample%20PDF.pdf',
    publicId: '',
    fileSize: 1876543,
    fileType: 'pdf' as const,
  },
  {
    fileName: 'History_Grade12_November2022_P1.pdf',
    subject: 'History',
    url: 'https://pdfobject.com/pdf/sample.pdf',
    publicId: '',
    fileSize: 2134567,
    fileType: 'pdf' as const,
  },
  {
    fileName: 'Business_Studies_Grade10_June2023_P1.pdf',
    subject: 'Business Studies',
    url: 'https://s24.q4cdn.com/216390268/files/doc_downloads/test.pdf',
    publicId: '',
    fileSize: 1789012,
    fileType: 'pdf' as const,
  },
];

export async function GET() {
  try {
    const existingCount = await db.pastPaper.count();
    if (existingCount === 0) {
      // This will now seed your database with the improved mock data
      await db.pastPaper.createMany({
        data: mockPastPapers,
      });
    }
    const pastPapers = await db.pastPaper.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(pastPapers);
  } catch (error) {
    console.error('Seed error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to seed or fetch past papers', details: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: 'Failed to seed or fetch past papers' }, { status: 500 });
  }
}
