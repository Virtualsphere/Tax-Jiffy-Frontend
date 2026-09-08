import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import { usePresenceReporter } from '@/hooks/usePresenceReporter';

export function App() {
  usePresenceReporter();

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
