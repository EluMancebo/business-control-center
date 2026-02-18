// src/app/[slug]/page.tsx

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <p className="text-sm text-muted-foreground">
            Web pública (dinámica)
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            {decodedSlug}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Si ves esto, /[slug] ya funciona correctamente en Next 15.
          </p>
        </div>
      </header>
    </main>
  );
}

