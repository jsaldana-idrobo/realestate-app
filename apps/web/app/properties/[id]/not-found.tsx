export default function NotFound() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Propiedad no encontrada</h2>
      <p className="text-sm text-muted-foreground">
        La propiedad solicitada no existe o fue eliminada.
      </p>
      <a className="underline" href="/properties">
        ← Volver al listado
      </a>
    </section>
  );
}
