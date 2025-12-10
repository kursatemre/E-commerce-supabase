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
        <h2 className="text-xl font-semibold text-brand-dark">Profil</h2>
        <p className="text-sm text-brand-dark/60">
          Kişisel bilgilerinizi güncelleyebilir ve şifrenizi değiştirebilirsiniz.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-surface-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-brand-dark">Profil Bilgileri</h3>
        <p className="text-sm text-brand-dark/60 mb-4">İletişim bilgilerinizi güncelleyin.</p>
        <form action={updateProfile} className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-dark">Ad</label>
              <input
                name="first_name"
                defaultValue={profile?.first_name ?? ""}
                required
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-dark">Soyad</label>
              <input
                name="last_name"
                defaultValue={profile?.last_name ?? ""}
                required
                className="input-field"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-dark">Telefon</label>
            <input
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              required
              className="input-field"
              placeholder="05XX XXX XX XX"
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
          >
            Güncelle
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-surface-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-brand-dark">Şifre Değiştir</h3>
        <p className="text-sm text-brand-dark/60 mb-4">Hesabınız için yeni bir şifre belirleyin.</p>
        <form action={updatePassword} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-dark">Mevcut Şifre</label>
            <input
              name="current_password"
              type="password"
              required
              className="input-field"
              placeholder="Mevcut şifreniz"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-dark">Yeni Şifre</label>
            <input
              name="new_password"
              type="password"
              required
              minLength={6}
              className="input-field"
              placeholder="En az 6 karakter"
            />
            <p className="text-xs text-brand-dark/40">
              Şifreniz en az 6 karakter olmalıdır
            </p>
          </div>
          <button
            type="submit"
            className="btn-primary"
          >
            Şifreyi Değiştir
          </button>
        </form>
      </section>
    </div>
  );
}
