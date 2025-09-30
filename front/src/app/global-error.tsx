'use client';
import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect, useMemo } from 'react';

import DevErrorPage from './dev-error';

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const timestamp = useMemo(() => new Date().toLocaleString(), []);

  if (process.env.NODE_ENV !== 'development') {
    return (
      <html>
        <body>
          {/* `NextError` is the default Next.js error page component. Its type
              definition requires a `statusCode` prop. However, since the App Router
              does not expose status codes for errors, we simply pass 0 to render a
              generic error message. */}
          <NextError statusCode={0} />
        </body>
      </html>
    );
  }

  return <DevErrorPage error={error} timestamp={timestamp} />;
}
