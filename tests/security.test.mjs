import test from "node:test";
import assert from "node:assert/strict";
import { metadata, validateFile, isUuid } from "../src/lib/validation.mjs";
import { signToken, verifyToken } from "../src/lib/auth.js";
process.env.ADMIN_JWT_SECRET = "test-only-secret-with-at-least-32-characters";
test("metadata allowlist strips privileged fields and rejects invalid titles", () => {
  const fields = metadata({
    title: "  Test  ",
    description: "Hello",
    tags: [" Nature ", "Nature"],
    is_published: false,
    views: 999,
    video_url: "https://evil.test",
  });
  assert.deepEqual(fields, {
    title: "Test",
    description: "Hello",
    tags: ["Nature"],
    is_published: false,
  });
  assert.throws(() => metadata({ title: "", is_published: true }));
  assert.throws(() =>
    metadata({ title: "ok", tags: ["a".repeat(41)], is_published: true }),
  );
  assert.throws(() => metadata({ title: "ok", is_published: "true" }));
});
test("uploads enforce MIME and size limits", () => {
  assert.equal(
    validateFile({ type: "video/mp4", size: 52428800 })[0],
    "videos",
  );
  assert.equal(
    validateFile({ type: "image/webp", size: 100 })[0],
    "thumbnails",
  );
  for (const f of [
    { type: "text/html", size: 2 },
    { type: "video/mp4", size: 52428801 },
    { type: "image/png", size: 5242881 },
    { type: "image/png", size: 0 },
  ])
    assert.throws(() => validateFile(f));
});
test("UUIDs reject malformed inputs", () => {
  assert.ok(isUuid("0ed2e095-24bc-4f0d-91e7-7d55f286bc84"));
  assert.ok(!isUuid("../secrets"));
});
test("JWT checks signatures, expiration, and separates upload capability from admin session", async () => {
  const token = await signToken({ role: "admin" });
  assert.equal((await verifyToken(token)).role, "admin");
  assert.equal(await verifyToken(token + "tamper"), null);
  assert.equal(await verifyToken(await signToken({}, "-1s")), null);
  assert.equal(await verifyToken(await signToken({}, "1h", "upload")), null);
});
