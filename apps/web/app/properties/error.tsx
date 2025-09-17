"use client";

export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{
  error: Error;
  reset: () => void;
}>) {
  console.error(error);
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Algo fue mal en esta página.</h2>
      <button className="underline" onClick={() => reset()}>
        Reintentar
      </button>
    </section>
  );
}
