"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30),
  message: z.string().trim().min(5).max(2000),
});

export type ContactState = { ok: boolean; error: string | null };

// Anon has no table rights (RLS), so the insert goes through the server-only admin client.
export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: bots fill the hidden field. Pretend success.
  if (formData.get("website")) return { ok: true, error: null };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, error: "Please enter your name and a message." };

  const { name, phone, message } = parsed.data;
  const { error } = await createAdminClient()
    .from("contact_messages")
    .insert({ name, phone: phone || null, message });
  if (error) return { ok: false, error: "Could not send your message. Please call us instead." };

  return { ok: true, error: null };
}
