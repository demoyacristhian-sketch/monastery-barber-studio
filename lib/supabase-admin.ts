import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Cliente con service_role: bypass RLS, solo usar en server actions / API routes
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
