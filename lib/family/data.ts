import { createClient } from "@/lib/supabase/server";

export type FamilyMember = {
  id: string;
  email: string;
  full_name: string | null;
  role: "parent" | "adulte";
  status: "pending" | "active";
};

export async function listFamilyMembers(): Promise<FamilyMember[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, email, full_name, role, status").order("status", { ascending: true });
  return data ?? [];
}
