import fs from "node:fs/promises";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
const required = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Set these values in .env.local: " + missing.join(", "));
  process.exit(1);
}
const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
  max: 1,
  prepare: false,
});
try {
  await sql.unsafe(
    await fs.readFile(
      new URL("../supabase/schema.sql", import.meta.url),
      "utf8",
    ),
  );
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  const publicClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  );
  const { error } = await publicClient.from("videos").select("id").limit(1);
  if (error) throw error;
  const { data: buckets, error: bucketError } =
    await admin.storage.listBuckets();
  if (bucketError) throw bucketError;
  if (!["videos", "thumbnails"].every((id) => buckets.some((b) => b.id === id)))
    throw new Error("Storage bucket verification failed");
  console.log(
    "VidShare schema, public read policy, and storage buckets are ready.",
  );
} catch (error) {
  console.error("Setup failed:", error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
