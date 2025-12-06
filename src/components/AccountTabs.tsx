"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AccountTab = {
  href: string;
  label: string;
  description?: string;
};

export function AccountTabs({ tabs }: { tabs: AccountTab[] }) {
  const pathname = usePathname();

  return (
    <nav className="overflow-auto rounded-2xl border bg-white p-2 shadow-sm">
      <ul className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <li key={tab.href} className="flex-1 min-w-[220px]">
              <Link
                href={tab.href}
                className={`block rounded-xl border px-4 py-3 transition ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-gray-50 text-gray-700 hover:border-gray-200"
                }`}
              >
                <p className="text-sm font-semibold">{tab.label}</p>
                {tab.description ? (
                  <p className="text-xs text-gray-500">{tab.description}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
