import "server-only";
import { createClient } from "@supabase/supabase-js";
export const configured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
export function serverClient(admin = false) {
  const key = admin
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!configured() || !key)
    throw new Error(
      "Supabase is not configured. Complete .env.local and run npm run setup.",
    );
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
