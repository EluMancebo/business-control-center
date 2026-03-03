// src/app/global-error.tsx
'use client'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const handleReset = () => reset()

  return (
    <html lang="es" id="global-error-html">
      <body id="global-error-body" className="min-h-screen bg-background text-foreground">
        <main
          id="global-error-main"
          role="alert"
          aria-live="polite"
          className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 py-12 text-center"
        >
          <h1 id="global-error-title" className="text-2xl font-semibold">
            Se ha producido un error
          </h1>

          <p id="global-error-message" className="text-sm text-muted-foreground">
            {process.env.NODE_ENV === 'development'
              ? error.message
              : 'Error inesperado. Inténtalo de nuevo.'}
          </p>

          <div id="global-error-actions" className="mt-2 flex items-center gap-3">
            <button
              id="global-error-retry-button"
              type="button"
              onClick={handleReset}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}    