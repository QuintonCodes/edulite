import { NextResponse } from 'next/server';

type PastPaper = {
  id: string;
  fileName: string;
  subject: string;
  url: string;
  fileSize: number;
  createdAt: string;
  uploader?: { name: string };
};

const mockPastPapers: PastPaper[] = [
  {
    id: '1',
    fileName: 'Mathematics_Grade12_November2023_P1.pdf',
    subject: 'Mathematics',
    url: 'https://pdfobject.com/pdf/sample.pdf',
    fileSize: 2456789,
    createdAt: '2023-11-15T10:00:00Z',
    uploader: { name: 'John Doe' },
  },
  {
    id: '2',
    fileName: 'Physical_Sciences_Grade11_June2023_P2.pdf',
    subject: 'Physical Sciences',
    url: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf',
    fileSize: 3234567,
    createdAt: '2023-06-20T14:30:00Z',
    uploader: { name: 'Jane Smith' },
  },
  {
    id: '3',
    fileName: 'Life_Sciences_Grade10_November2023_P1.pdf',
    subject: 'Life Sciences',
    url: 'https://s24.q4cdn.com/216390268/files/doc_downloads/test.pdf',
    fileSize: 1987654,
    createdAt: '2023-11-10T09:15:00Z',
    uploader: { name: 'EduLite Team' },
  },
  {
    id: '4',
    fileName: 'Geography_Grade12_September2023_P1.pdf',
    subject: 'Geography',
    url: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf',
    fileSize: 2765432,
    createdAt: '2023-09-05T11:45:00Z',
    uploader: { name: 'GeoExpert' },
  },
  {
    id: '5',
    fileName: 'Accounting_Grade11_November2023_P1.pdf',
    subject: 'Accounting',
    url: 'https://www.eta.gov.eg/sites/default/files/2020-12/pdf-test.pdf',
    fileSize: 2123456,
    createdAt: '2023-11-12T13:20:00Z',
    uploader: { name: 'Accounting Solutions' },
  },
  {
    id: '6',
    fileName: 'English_Home_Language_Grade12_November2023_P2.pdf',
    subject: 'English',
    url: 'https://www.auburncc.org/Downloads/Sample%20PDF.pdf',
    fileSize: 1876543,
    createdAt: '2023-11-18T15:10:00Z',
    uploader: { name: 'LangMasters' },
  },
];

export async function GET() {
  try {
    return NextResponse.json(mockPastPapers, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to seed or fetch past papers', details: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: 'Failed to seed or fetch past papers' }, { status: 500 });
  }
}
