import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("schema, full-text search, RLS, view counts, and shared login throttling", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`,
    );
    const schema = await fs.readFile(
      new URL("../supabase/schema.sql", import.meta.url),
      "utf8",
    );
    await db.exec(schema);
    await db.exec(schema);
    await db.exec(
      `insert into public.videos(id,title,description,tags,video_url,is_published) values ('11111111-1111-4111-8111-111111111111','Mountain walk','Wandering in the hills',array['Travel'],'https://example.test/video.mp4',true),('22222222-2222-4222-8222-222222222222','Private forest','Hidden',array['Nature'],'https://example.test/private.mp4',false);set role anon;`,
    );
    assert.equal(
      (await db.query("select * from public.videos")).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query(
          `select id from public.videos where search_vector @@ websearch_to_tsquery('english','mountain')`,
        )
      ).rows.length,
      1,
    );
    await assert.rejects(
      db.exec(`update public.videos set views=999`),
      /permission denied/,
    );
    await assert.rejects(
      db.exec(
        `select public.increment_view_count('11111111-1111-4111-8111-111111111111')`,
      ),
      /permission denied/,
    );
    await assert.rejects(
      db.exec(`select public.consume_login_attempt('test')`),
      /permission denied/,
    );
    await db.exec("reset role;set role service_role;");
    assert.equal(
      (
        await db.query(
          `select public.increment_view_count('11111111-1111-4111-8111-111111111111') as ok`,
        )
      ).rows[0].ok,
      true,
    );
    assert.equal(
      (
        await db.query(
          `select public.increment_view_count('22222222-2222-4222-8222-222222222222') as ok`,
        )
      ).rows[0].ok,
      false,
    );
    for (let i = 1; i <= 11; i++)
      assert.equal(
        (
          await db.query(
            `select public.consume_login_attempt('test') as allowed`,
          )
        ).rows[0].allowed,
        i <= 10,
      );
    await db.exec(
      `update public.login_attempts set window_start=now()-interval '16 minutes'`,
    );
    assert.equal(
      (await db.query(`select public.consume_login_attempt('test') as allowed`))
        .rows[0].allowed,
      true,
    );
  } finally {
    await db.close();
  }
});
