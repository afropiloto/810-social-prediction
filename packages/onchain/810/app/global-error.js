'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold">A critical error occurred</h2>
          <p className="mt-2 text-muted">{error?.message || 'Unknown error'}</p>
          <button
            onClick={() => reset()}
            className="mt-6 bg-accent text-black px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
