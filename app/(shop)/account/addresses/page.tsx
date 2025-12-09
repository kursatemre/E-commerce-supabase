import { createAddress, deleteAddress, setDefaultAddress, updateAddress } from "@/actions/addresses";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type AddressRecord = {
  id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  address_line: string | null;
  district: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export default async function AccountAddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: addressData, error } = await supabase
    .from("customer_addresses")
    .select("id, label, recipient_name, phone, address_line, district, city, postal_code, country, is_default, created_at, updated_at")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Customer addresses fetch error", error);
  }

  const addresses: AddressRecord[] = addressData ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">Adres Defteri</h2>
        <p className="text-sm text-gray-600">
          Teslimat ve fatura adreslerinizi burada yönetebilir, varsayılan adres seçebilir ve mevcut kayıtları
          güncelleyebilirsiniz.
        </p>
      </header>

      <AddAddressForm />

      <section className="space-y-4">
        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-gray-50 p-8 text-center text-sm text-gray-500">
            Henüz kaydedilmiş bir adresiniz yok. Yukarıdaki formu kullanarak ilk adresinizi ekleyebilirsiniz.
          </div>
        ) : (
          addresses.map((address) => <AddressCard key={address.id} address={address} />)
        )}
      </section>
    </div>
  );
}

function AddAddressForm() {
  return (
    <details className="rounded-2xl border bg-white p-6 shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900">
        <span>Yeni Adres Ekle</span>
        <span className="text-sm font-normal text-gray-500">Formu açmak için tıklayın</span>
      </summary>
      <p className="mt-2 text-sm text-gray-600">Teslimat için kullanmak istediğiniz adresi kaydedin.</p>
      <form action={createAddress} className="mt-4 space-y-4">
        <AddressFormFields />
        <div className="flex items-center gap-2">
          <input id="create-is-default" name="is_default" type="checkbox" className="h-4 w-4 rounded border-gray-300" />
          <label htmlFor="create-is-default" className="text-sm text-gray-700">
            Bu adresi varsayılan yap
          </label>
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          Adres Ekle
        </button>
      </form>
    </details>
  );
}

function AddressCard({ address }: { address: AddressRecord }) {
  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Adres Etiketi</p>
          <h3 className="text-lg font-semibold text-gray-900">{address.label || "Adres"}</h3>
          {address.is_default ? (
            <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Varsayılan Adres
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {!address.is_default ? (
            <form action={setDefaultAddress}>
              <input type="hidden" name="address_id" value={address.id} />
              <button
                type="submit"
                className="rounded-full border border-gray-200 px-4 py-1.5 font-medium text-gray-700 hover:border-gray-300"
              >
                Varsayılan Yap
              </button>
            </form>
          ) : null}
          <form action={deleteAddress}>
            <input type="hidden" name="address_id" value={address.id} />
            <button
              type="submit"
              className="rounded-full border border-red-200 px-4 py-1.5 font-medium text-red-600 hover:border-red-300"
            >
              Sil
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-gray-700">
        <p className="font-medium text-gray-900">{address.recipient_name}</p>
        <p>{address.address_line}</p>
        <p>
          {address.district ? `${address.district}, ` : ""}
          {address.city} {address.postal_code}
        </p>
        <p>{address.country || "Türkiye"}</p>
        <p className="text-xs text-gray-500">{address.phone || "Telefon belirtilmedi"}</p>
      </div>

      <details className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-800">Adresi Düzenle</summary>
        <form action={updateAddress} className="mt-4 space-y-4">
          <input type="hidden" name="address_id" value={address.id} />
          <AddressFormFields defaults={address} />
          <div className="flex items-center gap-2">
            <input
              id={`update-${address.id}`}
              name="is_default"
              type="checkbox"
              defaultChecked={address.is_default}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor={`update-${address.id}`} className="text-sm text-gray-700">
              Bu adresi varsayılan yap
            </label>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Adresi Güncelle
          </button>
        </form>
      </details>
    </article>
  );
}

function AddressFormFields({
  defaults,
}: {
  defaults?: Partial<Pick<AddressRecord, "label" | "recipient_name" | "phone" | "address_line" | "district" | "city" | "postal_code" | "country">>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Adres Etiketi</label>
        <input
          name="label"
          defaultValue={defaults?.label ?? "Ev"}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Alıcı Adı</label>
        <input
          name="recipient_name"
          defaultValue={defaults?.recipient_name ?? ""}
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Telefon</label>
        <input
          name="phone"
          defaultValue={defaults?.phone ?? ""}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="text-xs font-semibold text-gray-600">Adres Satırı</label>
        <textarea
          name="address_line"
          defaultValue={defaults?.address_line ?? ""}
          required
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">İlçe / Semt</label>
        <input
          name="district"
          defaultValue={defaults?.district ?? ""}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Şehir</label>
        <input
          name="city"
          defaultValue={defaults?.city ?? ""}
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Posta Kodu</label>
        <input
          name="postal_code"
          defaultValue={defaults?.postal_code ?? ""}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Ülke</label>
        <input
          name="country"
          defaultValue={defaults?.country ?? "Türkiye"}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
