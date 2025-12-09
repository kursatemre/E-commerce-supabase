import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountTabs } from "@/components/AccountTabs";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";

const accountTabs = [
  {
    href: "/account/orders",
    label: "Siparişlerim",
    description: "Geçmiş siparişler, durumlar ve iadeler",
  },
  {
    href: "/account/addresses",
    label: "Adres Defteri",
    description: "Teslimat adreslerini yönet",
  },
  {
    href: "/account/profile",
    label: "Profil",
    description: "Kişisel bilgiler ve şifre değiştirme",
  },
  {
    href: "/account/rewards",
    label: "Puan / Kupon",
    description: "Sadakat puanları ve kuponlar",
  },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("id", user.id)
    .single();

  const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Hesabım";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-surface-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-brand-dark/60">Hesap Özeti</p>
            <h1 className="mt-1 font-heading text-2xl font-semibold text-brand-dark">{fullName}</h1>
          </div>
          <LogoutButton />
        </div>
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-dark/40">E-posta</p>
            <p className="mt-1 font-medium text-brand-dark">{user.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-dark/40">Telefon</p>
            <p className="mt-1 font-medium text-brand-dark">{profile?.phone || "Tanımlı değil"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-dark/40">Hızlı İşlem</p>
            <Link href="/" className="mt-1 block font-medium text-action hover:text-action-hover transition-colors">
              Mağazaya Dön
            </Link>
          </div>
        </div>
      </div>

      <AccountTabs tabs={accountTabs} />

      <section className="rounded-2xl border border-gray-200 bg-surface-white p-6 shadow-sm">{children}</section>
    </div>
  );
}
