import { MainNav } from "@/components/shared/MainNav";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 flex flex-col">
      <MainNav />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
