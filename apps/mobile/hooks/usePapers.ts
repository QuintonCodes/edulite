import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { API_BASE } from '@/utils/constants';
import { PastPaper } from '@/utils/types';

// This type must match the one from your Prisma schema
type PastPaperAPI = {
  id: string;
  fileName: string;
  subject: string;
  url: string;
  fileSize: number;
  createdAt: string;
  uploader?: { name: string };
};

// Helper to format API data
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`;
}

const formatPastPaper = (paper: PastPaperAPI): PastPaper => ({
  id: paper.id,
  fileName: paper.fileName,
  subject: paper.subject,
  url: paper.url,
  fileSize: formatBytes(paper.fileSize),
  uploadDate: new Date(paper.createdAt).toLocaleDateString(),
  uploader: paper.uploader?.name || 'Anonymous',
  fileType: 'pdf',
});

async function fetchPastPapers(): Promise<PastPaper[]> {
  const { data } = await axios.get<PastPaperAPI[]>(`${API_BASE}/past-papers`);
  return data.map(formatPastPaper);
}

export function usePastPapers() {
  return useQuery({
    queryKey: ['pastPapers'],
    queryFn: fetchPastPapers,
  });
}
