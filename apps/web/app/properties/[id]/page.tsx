import { getProperty } from "@/lib/api";
import { notFound } from "next/navigation";

type SP = Promise<{ [key: string]: string | string[] | undefined }>;
type PP = Promise<{ id: string }>;

export async function generateMetadata({ params }: { readonly params: PP }) {
  const { id } = await params;

  try {
    const p = await getProperty(id);
    if (!p) {
      return {
        title: "Propiedad no encontrada · Real Estate",
        description: "La propiedad solicitada no existe.",
      };
    }
    return {
      title: `${p.name} · Real Estate`,
      description: `${
        p.addressProperty
      } — $${p.priceProperty.toLocaleString()}`,
    };
  } catch {
    return {
      title: "Detalle de propiedad · Real Estate",
      description: "Información de la propiedad.",
    };
  }
}

export default async function PropertyDetail({
  params,
  searchParams,
}: {
  readonly params: PP;
  readonly searchParams: SP;
}) {
  const { id } = await params;
  const sp = await searchParams;

  let item: Awaited<ReturnType<typeof getProperty>> | null = null;

  try {
    item = await getProperty(id);
    if (!item) notFound();
  } catch (e: any) {
    if (e?.status === 404) notFound();
    throw e;
  }

  const backQS = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== undefined && val !== null && String(val).length > 0) {
      backQS.set(k, String(val));
    }
  });

  const imgSrc = item.image?.trim()
    ? item.image
    : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'/>";

  return (
    <section className="space-y-4">
      <a
        className="text-sm underline"
        href={`/properties?${backQS.toString()}`}
      >
        ← Volver
      </a>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-[16/9] overflow-hidden rounded-xl bg-muted">
          <img
            src={imgSrc}
            alt={`Imagen de ${item.name}`}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>

        <div className="space-y-2">
          <h2 className="m-0 text-2xl font-semibold">{item.name}</h2>
          <p className="text-muted-foreground">{item.addressProperty}</p>
          <p className="text-lg font-semibold">
            ${item.priceProperty.toLocaleString()}
          </p>
          <p>
            <span className="text-muted-foreground">Owner:</span> {item.idOwner}
          </p>
        </div>
      </div>
    </section>
  );
}
