"use server"

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SettingsActionState = {
  success: boolean;
  message?: string;
};

const SETTINGS_TABLE = "store_settings";
const SETTINGS_ROW_ID = "primary";

const sanitizeString = (value: FormDataEntryValue | null, fallback = "") => {
  if (value === null) return fallback;
  const normalized = String(value).trim();
  return normalized.length ? normalized : fallback;
};

const sanitizeNullableString = (value: FormDataEntryValue | null) => {
  if (value === null) return null;
  const normalized = String(value).trim();
  return normalized.length ? normalized : null;
};

const sanitizeNumber = (value: FormDataEntryValue | null, fallback: number) => {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: FormDataEntryValue | null) => {
  if (value === null) return false;
  const normalized = String(value).toLowerCase();
  return normalized === "on" || normalized === "true" || normalized === "1";
};

async function upsertSettings(payload: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from(SETTINGS_TABLE).upsert({ id: SETTINGS_ROW_ID, ...payload }, { onConflict: "id" });
}

export async function saveStoreProfile(_: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const payload = {
    store_name: sanitizeString(formData.get("store_name"), "Mağazanız"),
    support_email: sanitizeString(formData.get("support_email"), "destek@example.com"),
    support_phone: sanitizeString(formData.get("support_phone"), "+90 000 000 00 00"),
    preferred_currency: sanitizeString(formData.get("preferred_currency"), "TRY"),
    return_window_days: sanitizeNumber(formData.get("return_window_days"), 14),
    timezone: sanitizeString(formData.get("timezone"), "Europe/Istanbul"),
    working_hours: sanitizeString(formData.get("working_hours"), "09:00 - 18:00"),
  };

  const { error } = await upsertSettings(payload);

  if (error) {
    console.error("[Settings] Store profile save failed", error);
    return { success: false, message: "Mağaza bilgileri kaydedilemedi." };
  }

  revalidatePath("/admin/(panel)/settings");
  return { success: true, message: "Mağaza bilgileri güncellendi." };
}

export async function saveNotificationSettings(_: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const payload = {
    notifications_email: toBoolean(formData.get("notifications_email")),
    notifications_sms: toBoolean(formData.get("notifications_sms")),
    notifications_returns: toBoolean(formData.get("notifications_returns")),
    alerts_low_stock: toBoolean(formData.get("alerts_low_stock")),
    alerts_high_risk: toBoolean(formData.get("alerts_high_risk")),
    alert_email: sanitizeNullableString(formData.get("alert_email")),
    slack_webhook_url: sanitizeNullableString(formData.get("slack_webhook_url")),
  };

  const { error } = await upsertSettings(payload);

  if (error) {
    console.error("[Settings] Notification save failed", error);
    return { success: false, message: "Bildirim tercihleri kaydedilemedi." };
  }

  revalidatePath("/admin/(panel)/settings");
  return { success: true, message: "Bildirim tercihleri güncellendi." };
}

export async function saveSecuritySettings(_: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const payload = {
    two_factor_required: toBoolean(formData.get("two_factor_required")),
    session_timeout_minutes: sanitizeNumber(formData.get("session_timeout_minutes"), 30),
    allowed_domains: sanitizeNullableString(formData.get("allowed_domains")),
    ip_allowlist: sanitizeNullableString(formData.get("ip_allowlist")),
    login_alert_email: sanitizeNullableString(formData.get("login_alert_email")),
  };

  const { error } = await upsertSettings(payload);

  if (error) {
    console.error("[Settings] Security save failed", error);
    return { success: false, message: "Güvenlik ayarları kaydedilemedi." };
  }

  revalidatePath("/admin/(panel)/settings");
  return { success: true, message: "Güvenlik ayarları güncellendi." };
}
