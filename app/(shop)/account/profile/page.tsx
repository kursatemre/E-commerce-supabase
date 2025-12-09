import { updatePassword, updateProfile } from "@/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AccountProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, kvkk_consent")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">Kişisel Bilgiler</h2>
        <p className="text-sm text-gray-600">
          Profil detaylarınızı güncelleyebilir ve Supabase hesabınızın şifresini değiştirebilirsiniz.
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Profil Bilgileri</h3>
        <p className="text-sm text-gray-600">İletişim bilgilerinizi ve KVKK onayınızı güncelleyin.</p>
        <form action={updateProfile} className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Ad</label>
              <input
                name="first_name"
                defaultValue={profile?.first_name ?? ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Soyad</label>
              <input
                name="last_name"
                defaultValue={profile?.last_name ?? ""}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Telefon</label>
            <input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="05xx xxx xx xx"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
            <input
              id="kvkk-consent"
              name="kvkk_consent"
              type="checkbox"
              defaultChecked={profile?.kvkk_consent ?? false}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="kvkk-consent" className="text-sm text-gray-700">
              Kişisel verilerimin KVKK kapsamında işlenmesini onaylıyorum.
            </label>
          </div>
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Profil Bilgilerini Güncelle
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h3>
        <p className="text-sm text-gray-600">Supabase Auth ile ilişkili hesabınız için yeni bir şifre belirleyin.</p>
        <form action={updatePassword} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Mevcut Şifre</label>
            <input
              name="current_password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Yeni Şifre</label>
            <input
              name="new_password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Şifreyi Güncelle
          </button>
        </form>
      </section>
    </div>
  );
}
