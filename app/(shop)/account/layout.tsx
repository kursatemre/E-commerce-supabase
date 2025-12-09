import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountTabs } from "@/components/AccountTabs";
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
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Hesap Özeti</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">{fullName}</h1>
        <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">E-posta</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Telefon</p>
            <p className="font-medium text-gray-900">{profile?.phone || "Tanımlı değil"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Hızlı İşlem</p>
            <Link href="/" className="font-medium text-primary">
              Mağazaya Dön
            </Link>
          </div>
        </div>
      </div>

      <AccountTabs tabs={accountTabs} />

      <section className="rounded-2xl border bg-white p-6 shadow-sm">{children}</section>
    </div>
  );
}
