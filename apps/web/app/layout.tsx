import TanstackProvider from "@/components/providers/tanstack-provider";
import "./globals.css";

export const metadata = {
  title: "Real Estate",
  description: "Listado de propiedades",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="es" className="bg-background">
      <body className="bg-background text-foreground antialiased">
        <header className="border-b">
          <div className="container py-4">
            <h1 className="m-0 text-xl font-semibold">Real Estate</h1>
          </div>
        </header>
        <TanstackProvider>
          <main className="container py-6 min-h-screen">{children}</main>
        </TanstackProvider>
      </body>
    </html>
  );
}
