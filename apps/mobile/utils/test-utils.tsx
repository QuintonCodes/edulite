import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { ReactNode } from 'react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export function renderWithClient(ui: ReactNode) {
  const testClient = createTestQueryClient();
  return render(<QueryClientProvider client={testClient}>{ui}</QueryClientProvider>);
}
