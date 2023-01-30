import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode, useMemo } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { useState } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ClientStyleContext from '~/mui/ClientStyleContext';
import createEmotionCache from '~/mui/createEmotionCache';
import theme from '~/mui/theme';
interface ClientCacheProviderProps {
  children: React.ReactNode;
}
function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(createEmotionCache());

  const clientStyleContextValue = useMemo(
    () => ({
      reset() {
        setCache(createEmotionCache());
      },
    }),
    []
  );

  return (
    <ClientStyleContext.Provider value={clientStyleContextValue}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
}

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <ClientCacheProvider>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <RemixBrowser />
          </ThemeProvider>
        </ClientCacheProvider>
      </StrictMode>
    );
  });
}

if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1);
}

if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/entry.worker.js', { type: 'module' })
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SYNC_REMIX_MANIFEST',
            manifest: window.__remixManifest,
          });
        } else {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            navigator.serviceWorker.controller?.postMessage({
              type: 'SYNC_REMIX_MANIFEST',
              manifest: window.__remixManifest,
            });
          });
        }
      })
      .catch((error) => {
        console.error('Service worker registration failed', error);
      });
  });
}
