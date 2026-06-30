"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/shared/LogoutButton";

const NAV_ITEMS = [
  { href: "/angebote", label: "Angebote" },
  { href: "/schulungsinhalte", label: "Schulungsinhalte" },
  { href: "/kunden", label: "Kundenmanagement" },
  { href: "/settings", label: "Einstellungen" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
        <span className="font-semibold">Business Manager</span>
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
