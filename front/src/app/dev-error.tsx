'use client';

export default function DevErrorPage({
  error,
  timestamp
}: {
  error: Error & { digest?: string };
  timestamp: string;
}) {
  // render dev page
  const trimmedName = error.name.trim();
  const errorName = trimmedName.length > 0 ? trimmedName : 'Error';
  const stackLines = error.stack
    ?.split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <html lang='en'>
      <head>
        <title>Application Error</title>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />
        <style>{DEV_MODE_CSS}</style>
      </head>
      <body>
        <main>
          <section className='card'>
            <span className='badge'>Development</span>
            <h1>Something went wrong.</h1>
            <p className='subtitle'>
              The error below is only visible in development so you can fix it
              quickly.
            </p>
            <div className='message'>
              <strong>{errorName}:</strong> {error.message}
            </div>
            <div className='meta'>
              <span>
                <strong>Digest:</strong> {error.digest ?? 'n/a'}
              </span>
              <span>
                <strong>Timestamp:</strong> {timestamp}
              </span>
            </div>
            {stackLines !== undefined && stackLines.length > 0 ? (
              <pre className='stack'>
                {stackLines.map((line, index) => (
                  <div key={index} className='stack-line'>
                    {line}
                  </div>
                ))}
              </pre>
            ) : null}
            <footer>
              <span>
                You can edit the source and save to reload this page instantly.
              </span>
              <a href='#' onClick={() => window.location.reload()}>
                Reload page
              </a>
            </footer>
          </section>
        </main>
      </body>
    </html>
  );
}

export const DEV_MODE_CSS = `
            :root { color-scheme: dark; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                sans-serif;
              background: radial-gradient(120% 120% at 50% 0%, #1e293b 0%, #020617 100%);
              color: #e2e8f0;
            }
            main {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 3rem 1.5rem;
            }
            .card {
              width: min(900px, 100%);
              background: rgba(2, 6, 23, 0.85);
              border: 1px solid rgba(148, 163, 184, 0.2);
              border-radius: 18px;
              padding: 2.5rem;
              box-shadow: 0 30px 60px rgba(15, 23, 42, 0.45);
              backdrop-filter: blur(10px);
            }
            h1 {
              margin: 0 0 1.5rem;
              font-size: clamp(1.75rem, 3vw, 2.5rem);
              letter-spacing: -0.025em;
            }
            .subtitle {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 0.95rem;
              color: #cbd5f5;
              margin-bottom: 1.75rem;
            }
            .badge {
              padding: 0.2rem 0.75rem;
              border-radius: 999px;
              background: rgba(250, 204, 21, 0.15);
              color: #facc15;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              font-size: 0.75rem;
            }
            .message {
              margin: 0 0 1.5rem;
              padding: 1rem 1.25rem;
              background: rgba(248, 113, 113, 0.12);
              border: 1px solid rgba(248, 113, 113, 0.25);
              border-radius: 12px;
              font-size: 1rem;
              line-height: 1.6;
              word-break: break-word;
            }
            .meta {
              display: flex;
              flex-wrap: wrap;
              gap: 1rem;
              margin-bottom: 1.75rem;
              font-size: 0.85rem;
              color: rgba(148, 163, 184, 0.85);
            }
            .meta span {
              display: inline-flex;
              align-items: center;
              gap: 0.4rem;
            }
            .stack {
              margin: 0;
              padding: 1.5rem;
              background: rgba(15, 23, 42, 0.8);
              border-radius: 14px;
              border: 1px solid rgba(148, 163, 184, 0.25);
              font-family: 'JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Consolas', monospace;
              font-size: 0.85rem;
              line-height: 1.6;
              overflow-x: auto;
              white-space: pre;
            }
            .stack-line + .stack-line {
              margin-top: 0.5rem;
            }
            footer {
              margin-top: 2rem;
              font-size: 0.8rem;
              color: rgba(148, 163, 184, 0.7);
              display: flex;
              justify-content: space-between;
              gap: 1rem;
              flex-wrap: wrap;
            }
            a {
              color: #38bdf8;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          `;
